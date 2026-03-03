import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sale, SaleDocument } from '../../database/schemas/sale.schema';
import { CreateSaleDto } from './dto/create-sale.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class SalesService {
  constructor(
    @InjectModel(Sale.name) private saleModel: Model<SaleDocument>,
    private productsService: ProductsService,
  ) {}

  async create(createSaleDto: CreateSaleDto): Promise<Sale> {
    // Validar que todos los productos existan y tengan stock
    const saleItems = [];
    let total = 0;

    for (const item of createSaleDto.items) {
      const product = await this.productsService.findOne(item.productoId);

      if (product.cantidad < item.cantidad) {
        throw new BadRequestException(
          `Stock insuficiente para ${product.nombre}. Disponible: ${product.cantidad}`,
        );
      }

      const subtotal = product.precioUnitario * item.cantidad;
      total += subtotal;

      saleItems.push({
        producto: product._id,
        barcode: product.barcode,
        nombre: product.nombre,
        marca: product.marca,
        precioUnitario: product.precioUnitario,
        cantidad: item.cantidad,
        subtotal,
      });

      // Descontar stock
      await this.productsService.updateStock(item.productoId, {
        cantidad: item.cantidad,
        operacion: 'subtract',
      });
    }

    // Generar número de recibo único
    const numeroRecibo = await this.generateReceiptNumber();

    const createdSale = new this.saleModel({
      numeroRecibo,
      items: saleItems,
      total,
      fecha: new Date(),
    });

    return createdSale.save();
  }

  async findAll(startDate?: string, endDate?: string, limit = 50, page = 1): Promise<Sale[]> {
    const query: any = {};

    if (startDate || endDate) {
      query.fecha = {};
      if (startDate) {
        query.fecha.$gte = new Date(startDate);
      }
      if (endDate) {
        query.fecha.$lte = new Date(endDate);
      }
    }

    return this.saleModel
      .find(query)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ fecha: -1 })
      .populate('items.producto')
      .exec();
  }

  async findOne(id: string): Promise<Sale> {
    const sale = await this.saleModel
      .findById(id)
      .populate('items.producto')
      .exec();

    if (!sale) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada`);
    }

    return sale;
  }

  async findByReceiptNumber(numeroRecibo: string): Promise<Sale> {
    const sale = await this.saleModel
      .findOne({ numeroRecibo })
      .populate('items.producto')
      .exec();

    if (!sale) {
      throw new NotFoundException(`Venta con recibo ${numeroRecibo} no encontrada`);
    }

    return sale;
  }

  async getTodaySales(): Promise<{ count: number; total: number }> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const sales = await this.saleModel
      .find({
        fecha: { $gte: startOfDay, $lte: endOfDay },
      })
      .exec();

    const total = sales.reduce((sum, sale) => sum + sale.total, 0);

    return {
      count: sales.length,
      total,
    };
  }

  async getTopProducts(limit = 5): Promise<any[]> {
    const result = await this.saleModel.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.producto',
          nombre: { $first: '$items.nombre' },
          marca: { $first: '$items.marca' },
          totalVendido: { $sum: '$items.cantidad' },
          ingresos: { $sum: '$items.subtotal' },
        },
      },
      { $sort: { totalVendido: -1 } },
      { $limit: limit },
    ]);

    return result;
  }

  private async generateReceiptNumber(): Promise<string> {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    
    // Contar ventas del día para generar secuencia
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const count = await this.saleModel.countDocuments({
      fecha: { $gte: startOfDay },
    });

    const sequence = String(count + 1).padStart(4, '0');
    return `REC-${dateStr}-${sequence}`;
  }
}
