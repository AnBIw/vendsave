import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('tipo') tipo?: string,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    return this.productsService.findAll(
      search,
      tipo,
      limit ? parseInt(limit) : undefined,
      page ? parseInt(page) : undefined,
    );
  }

  @Get('low-stock')
  getLowStock(@Query('threshold') threshold?: string) {
    return this.productsService.getLowStockProducts(
      threshold ? parseInt(threshold) : undefined,
    );
  }

  @Get('count')
  getTotalCount() {
    return this.productsService.getTotalProductsCount();
  }

  @Get('barcode/:code')
  findByBarcode(@Param('code') code: string) {
    return this.productsService.findByBarcode(code);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Patch(':id/stock')
  updateStock(@Param('id') id: string, @Body() updateStockDto: UpdateStockDto) {
    return this.productsService.updateStock(id, updateStockDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
