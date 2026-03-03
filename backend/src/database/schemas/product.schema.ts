import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, unique: true, index: true })
  barcode: string;

  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  marca: string;

  @Prop({ required: true })
  modelo: string;

  @Prop({ required: true })
  tipo: string;

  @Prop({ required: true, min: 0 })
  precioUnitario: number;

  @Prop({ required: true, default: 0, min: 0 })
  cantidad: number;

  @Prop({ default: Date.now })
  fechaRegistro: Date;

  @Prop({ default: Date.now })
  ultimaActualizacion: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Índices adicionales para búsquedas
ProductSchema.index({ nombre: 'text', marca: 'text', modelo: 'text' });
ProductSchema.index({ tipo: 1 });
