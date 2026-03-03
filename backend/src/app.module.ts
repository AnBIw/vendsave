import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from './database/database.module';
import { ProductsModule } from './modules/products/products.module';
import { SalesModule } from './modules/sales/sales.module';
import { BarcodeModule } from './modules/barcode/barcode.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/vendsave', {
      autoCreate: true,
      serverSelectionTimeoutMS: 5000, // 5 segundos de timeout
      socketTimeoutMS: 45000,
      family: 4, // Usar IPv4
      retryWrites: true,
      retryReads: true,
    }),
    DatabaseModule,
    ProductsModule,
    SalesModule,
    BarcodeModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
