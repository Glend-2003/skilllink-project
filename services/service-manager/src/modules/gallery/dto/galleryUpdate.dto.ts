import { PartialType } from '@nestjs/mapped-types';
import { GalleryCreateDto } from './galleryCreate.dto';

export class UpdateGalleryDto extends PartialType(GalleryCreateDto) {}
