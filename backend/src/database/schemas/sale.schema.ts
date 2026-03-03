import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export class SaleItem {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product' })
  producto: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  barcode: string;

  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  marca: string;

  @Prop({ required: true })
  precioUnitario: number;

  @Prop({ required: true, min: 1 })
  cantidad: number;

  @Prop({ required: true })
  subtotal: number;
}

export type SaleDocument = Sale & Document;

@Schema({ timestamps: true })
export class Sale {
  @Prop({ required: true, unique: true })
  numeroRecibo: string;

  @Prop({ type: [SaleItem], required: true })
  items: SaleItem[];

  @Prop({ required: true, min: 0 })
  total: number;

  @Prop({ default: Date.now })
  fecha: Date;
}

export const SaleSchema = SchemaFactory.createForClass(Sale);

// Índices para búsquedas
SaleSchema.index({ fecha: -1 });
SaleSchema.index({ numeroRecibo: 1 });
