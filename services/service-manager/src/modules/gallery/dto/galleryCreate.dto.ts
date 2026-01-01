import { IsString, IsNumber, IsOptional, IsUrl } from 'class-validator';

export class GalleryCreateDto {
  @IsNumber()
  @IsOptional()
  serviceId?: number;

  @IsNumber()
  providerId: number;

  @IsUrl()
  imageUrl: string;

  @IsString()
  @IsOptional()
  imageTitle?: string;

  @IsString()
  @IsOptional()
  imageDescription?: string;

  @IsNumber()
  @IsOptional()
  displayOrder?: number;
}
