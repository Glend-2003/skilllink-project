import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gallery } from './entities/gallery.entity';
import { GalleryCreateDto } from './dto/galleryCreate.dto';
import { Service } from '../services/entities/service.entity';

@Injectable()
export class GalleryService {
  constructor(
    @InjectRepository(Gallery)
    private readonly galleryRepository: Repository<Gallery>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  // Create a new gallery image
  async create(createDto: GalleryCreateDto) {
    // If serviceId is provided, verify ownership
    if (createDto.serviceId) {
      const service = await this.serviceRepository.findOne({
        where: { serviceId: createDto.serviceId },
        relations: ['provider'],
      });

      if (!service) {
        throw new NotFoundException('El servicio especificado no existe.');
      }
      // Check if the provider owns the service
      if (service.provider.providerId !== createDto.providerId) {
        throw new ForbiddenException(
          'No se puede subir fotos a un servicio que no es tuyo.',
        );
      }
    }

    try {
      const newImage = this.galleryRepository.create(createDto);
      return await this.galleryRepository.save(newImage);
    } catch (error: unknown) {
      const dbError = error as { errno?: number; code?: string };
      if (dbError.errno === 1452) {
        throw new BadRequestException(
          'El Servicio con ID o Proveedor con ID proporcionado no existe.',
        );
      }
      throw new InternalServerErrorException('Error al subir la imagen.');
    }
  }

  // Find an image by ID
  async findOne(id: number) {
    const image = await this.galleryRepository.findOneBy({ galleryId: id });
    if (!image) {
      throw new NotFoundException(`La imagen con ID ${id} no existe.`);
    }
    return image;
  }

  // Find all images for a specific service
  async findAllByService(serviceId: number) {
    return await this.galleryRepository.find({
      where: { serviceId },
      order: { displayOrder: 'ASC', uploadedAt: 'DESC' },
    });
  }

  // Delete an image by ID
  async remove(id: number) {
    const result = await this.galleryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `No se pudo eliminar: La imagen con ID ${id} no existe.`,
      );
    }
    return { message: 'Imagen eliminada correctamente.' };
  }

  // Toggle approval status of an image
  async toggleApproval(id: number) {
    const image = await this.galleryRepository.findOneBy({ galleryId: id });
    if (!image) {
      throw new NotFoundException('Imagen no encontrada.');
    }
    image.isApproved = !image.isApproved;
    image.approvalDate = image.isApproved ? new Date() : null;
    return await this.galleryRepository.save(image);
  }
}
