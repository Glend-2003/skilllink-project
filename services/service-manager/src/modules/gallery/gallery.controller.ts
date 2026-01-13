import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Get,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { GalleryService } from './gallery.services';
import { GalleryCreateDto } from './dto/galleryCreate.dto';

@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Post()
  create(@Body() createDto: GalleryCreateDto) {
    return this.galleryService.create(createDto);
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
