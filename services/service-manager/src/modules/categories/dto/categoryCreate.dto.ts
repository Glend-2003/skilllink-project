import {
  IsString,
  IsInt,
  IsOptional,
  IsNotEmpty,
  IsBoolean,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString({ message: 'El nombre debe ser texto' })
  @MaxLength(100, { message: 'El nombre es muy largo (máx 100 caracteres)' })
  categoryName!: string;

  @IsOptional()
  @IsString()
  categoryDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  iconUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  parentCategoryId?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  displayOrder?: number;
}
