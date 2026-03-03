import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  marca?: string;

  @IsOptional()
  @IsString()
  modelo?: string;

  @IsOptional()
  @IsString()
  tipo?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  precioUnitario?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  cantidad?: number;
}
