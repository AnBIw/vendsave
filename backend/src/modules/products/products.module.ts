import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product, ProductSchema } from '../../database/schemas/product.schema';
import { BarcodeModule } from '../barcode/barcode.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    BarcodeModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
