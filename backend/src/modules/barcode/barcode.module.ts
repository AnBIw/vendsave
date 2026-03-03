import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BarcodeController } from './barcode.controller';
import { BarcodeService } from './barcode.service';
import { Product, ProductSchema } from '../../database/schemas/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
  ],
  controllers: [BarcodeController],
  providers: [BarcodeService],
  exports: [BarcodeService],
})
export class BarcodeModule {}
