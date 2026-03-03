import { IsString, IsNumber, IsNotEmpty, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  marca: string;

  @IsString()
  @IsNotEmpty()
  modelo: string;

  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  precioUnitario: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  cantidad: number;

  @IsOptional()
  @IsString()
  barcode?: string; // Opcional, se genera automáticamente si no se proporciona
}
