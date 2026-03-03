import { IsArray, IsNotEmpty, ValidateNested, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SaleItemDto {
  @IsString()
  @IsNotEmpty()
  productoId: string;

  @IsNumber()
  @Min(1)
  cantidad: number;
}

export class CreateSaleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];
}
