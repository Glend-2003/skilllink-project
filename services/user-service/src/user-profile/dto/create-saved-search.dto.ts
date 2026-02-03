import { IsOptional, IsString, IsNumber, IsInt, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSavedSearchDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  categoryId?: number;

  @ApiProperty({ example: 'Plomeros en Heredia', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  searchQuery?: string;

  @ApiProperty({ example: 9.3281, required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ example: -84.0307, required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsInt()
  radius?: number;
}