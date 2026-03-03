import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { Sale, SaleSchema } from '../../database/schemas/sale.schema';
import { ProductsModule } from '../products/products.module';
import { PdfService } from '../../common/services/pdf.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Sale.name, schema: SaleSchema }]),
    ProductsModule,
  ],
  controllers: [SalesController],
  providers: [SalesService, PdfService],
  exports: [SalesService],
})
export class SalesModule {}
