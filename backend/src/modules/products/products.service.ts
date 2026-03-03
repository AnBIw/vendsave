import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../../database/schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { BarcodeService } from '../barcode/barcode.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private barcodeService: BarcodeService,
  ) {}

  private normalizeBarcode(barcode: string): string {
    return barcode.trim();
  }

  private escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async create(createProductDto: CreateProductDto): Promise<ProductDocument> {
    // Si no se proporciona código de barras, generar uno
    if (!createProductDto.barcode) {
      createProductDto.barcode = await this.barcodeService.generateUniqueCode(createProductDto.tipo);
    } else {
      createProductDto.barcode = this.normalizeBarcode(createProductDto.barcode);
    }

    const createdProduct = new this.productModel({
      ...createProductDto,
      fechaRegistro: new Date(),
      ultimaActualizacion: new Date(),
    });

    return createdProduct.save();
  }

  async findAll(
    search?: string,
    tipo?: string,
    limit = 50,
    page = 1,
  ): Promise<ProductDocument[]> {
    const query: any = {};

    if (search) {
      query.$or = [
        { nombre: { $regex: search, $options: 'i' } },
        { marca: { $regex: search, $options: 'i' } },
        { modelo: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
      ];
    }

    if (tipo) {
      query.tipo = tipo;
    }

    return this.productModel
      .find(query)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ ultimaActualizacion: -1 })
      .exec();
  }

  async findOne(id: string): Promise<ProductDocument> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return product;
  }

  async findByBarcode(barcode: string): Promise<ProductDocument | null> {
    const normalizedBarcode = this.normalizeBarcode(barcode);

    let product = await this.productModel.findOne({ barcode: normalizedBarcode }).exec();

    if (!product) {
      const escapedBarcode = this.escapeRegex(normalizedBarcode);
      product = await this.productModel
        .findOne({ barcode: { $regex: `^${escapedBarcode}$`, $options: 'i' } })
        .exec();
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<ProductDocument> {
    const updatedProduct = await this.productModel
      .findByIdAndUpdate(
        id,
        { ...updateProductDto, ultimaActualizacion: new Date() },
        { new: true },
      )
      .exec();

    if (!updatedProduct) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return updatedProduct;
  }

  async updateStock(id: string, updateStockDto: UpdateStockDto): Promise<ProductDocument> {
    const product = await this.findOne(id);
    
    let newQuantity: number;
    if (updateStockDto.operacion === 'add') {
      newQuantity = product.cantidad + updateStockDto.cantidad;
    } else {
      newQuantity = product.cantidad - updateStockDto.cantidad;
      if (newQuantity < 0) {
        throw new BadRequestException('Stock insuficiente');
      }
    }

    return this.update(id, { cantidad: newQuantity });
  }

  async remove(id: string): Promise<{ success: boolean }> {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return { success: true };
  }

  async getLowStockProducts(threshold = 5): Promise<ProductDocument[]> {
    return this.productModel
      .find({ cantidad: { $lt: threshold } })
      .sort({ cantidad: 1 })
      .exec();
  }

  async getTotalProductsCount(): Promise<number> {
    return this.productModel.countDocuments().exec();
  }
}
