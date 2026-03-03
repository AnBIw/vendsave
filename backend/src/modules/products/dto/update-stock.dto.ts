import { IsNumber, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateStockDto {
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  cantidad: number;

  @IsIn(['add', 'subtract'])
  operacion: 'add' | 'subtract';
}
