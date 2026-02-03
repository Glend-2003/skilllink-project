import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Get,
  Delete,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { GalleryService } from './gallery.services';
import { GalleryCreateDto } from './dto/galleryCreate.dto';

@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  // Create gallery entry with URL (existing method)
  @Post()
  create(@Body() createDto: GalleryCreateDto) {
    return this.galleryService.create(createDto);
  }

  // Upload single image file
  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('serviceId') serviceId: string,
    @Body('providerId') providerId: string,
    @Body('imageTitle') imageTitle?: string,
    @Body('imageDescription') imageDescription?: string,
    @Body('displayOrder') displayOrder?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    if (!providerId) {
      throw new BadRequestException('El providerId es requerido');
    }

    return this.galleryService.uploadImage(file, {
      serviceId: serviceId ? parseInt(serviceId) : undefined,
      providerId: parseInt(providerId),
      imageTitle,
      imageDescription,
      displayOrder: displayOrder ? parseInt(displayOrder) : undefined,
    });
  }

  // Upload multiple images
  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('images', 10))
  async uploadMultipleImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('serviceId') serviceId: string,
    @Body('providerId') providerId: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se proporcionaron archivos');
    }

    if (!providerId) {
      throw new BadRequestException('El providerId es requerido');
    }

    return this.galleryService.uploadMultipleImages(files, {
      serviceId: serviceId ? parseInt(serviceId) : undefined,
      providerId: parseInt(providerId),
    });
  }


  @Get('service/:id')
  findByService(@Param('id', ParseIntPipe) id: number) {
    return this.galleryService.findAllByService(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.galleryService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.galleryService.remove(id);
  }

  @Patch(':id/approve')
  toggleApproval(@Param('id', ParseIntPipe) id: number) {
    return this.galleryService.toggleApproval(id);
  }
}
