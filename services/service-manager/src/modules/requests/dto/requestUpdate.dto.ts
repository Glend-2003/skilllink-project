import { PartialType } from '@nestjs/mapped-types';
import { CreateRequestDto } from './requestCreate.dto';
import { IsEnum, IsOptional, IsNumber } from 'class-validator';

export class UpdateRequestDto extends PartialType(CreateRequestDto) {
  @IsOptional()
  @IsEnum(['pending', 'accepted', 'in_progress', 'completed', 'cancelled'])
  status?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  finalCost?: number;
}
