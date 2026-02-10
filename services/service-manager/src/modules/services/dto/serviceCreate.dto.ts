import {
  IsString,
  IsInt,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateServiceDto {
  @IsNotEmpty()
  @IsInt()
  providerId!: number;

  @IsNotEmpty()
  @IsInt()
  categoryId!: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  serviceTitle!: string;

  @IsNotEmpty()
  @IsString()
  serviceDescription!: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  basePrice?: number;

  @IsEnum(['fixed', 'hourly', 'negotiable'])
  priceType!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedDurationMinutes?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
