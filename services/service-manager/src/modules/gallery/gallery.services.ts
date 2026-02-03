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
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class GalleryService {
  constructor(
    @InjectRepository(Gallery)
    private readonly galleryRepository: Repository<Gallery>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    private readonly cloudinaryService: CloudinaryService,
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
    const image = await this.galleryRepository.findOneBy({ galleryId: id });
    
    if (!image) {
      throw new NotFoundException(
        `No se pudo eliminar: La imagen con ID ${id} no existe.`,
      );
    }

    // Delete from Cloudinary if it's a Cloudinary URL
    if (image.imageUrl && image.imageUrl.includes('cloudinary')) {
      try {
        const publicId = this.cloudinaryService.extractPublicId(image.imageUrl);
        if (publicId) {
          await this.cloudinaryService.deleteImage(publicId);
        }
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        // Continue with DB deletion even if Cloudinary deletion fails
      }
    }

    await this.galleryRepository.delete(id);
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

  // Upload single image to Cloudinary
  async uploadImage(
    file: Express.Multer.File,
    data: {
      serviceId?: number;
      providerId: number;
      imageTitle?: string;
      imageDescription?: string;
      displayOrder?: number;
    },
  ) {
    // Verify ownership if serviceId is provided
    if (data.serviceId) {
      await this.verifyServiceOwnership(data.serviceId, data.providerId);
    }

    try {
      // Upload to Cloudinary
      const uploadResult = await this.cloudinaryService.uploadImage(
        file,
        'skilllink/services',
      );

      // Create gallery entry with Cloudinary URL
      const createDto: GalleryCreateDto = {
        serviceId: data.serviceId,
        providerId: data.providerId,
        imageUrl: uploadResult.secure_url,
        imageTitle: data.imageTitle,
        imageDescription: data.imageDescription,
        displayOrder: data.displayOrder,
      };

      return await this.create(createDto);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al subir la imagen: ' + error.message,
      );
    }
  }

  // Upload multiple images to Cloudinary
  async uploadMultipleImages(
    files: Express.Multer.File[],
    data: {
      serviceId?: number;
      providerId: number;
    },
  ) {
    // Verify ownership if serviceId is provided
    if (data.serviceId) {
      await this.verifyServiceOwnership(data.serviceId, data.providerId);
    }

    const uploadedImages = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const uploadResult = await this.cloudinaryService.uploadImage(
          files[i],
          'skilllink/services',
        );

        const createDto: GalleryCreateDto = {
          serviceId: data.serviceId,
          providerId: data.providerId,
          imageUrl: uploadResult.secure_url,
          imageTitle: files[i].originalname,
          displayOrder: i,
        };

        const savedImage = await this.create(createDto);
        uploadedImages.push(savedImage);
      } catch (error) {
        errors.push({
          fileName: files[i].originalname,
          error: error.message,
        });
      }
    }

    return {
      success: uploadedImages.length,
      uploaded: uploadedImages,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  // Helper method to verify service ownership
  private async verifyServiceOwnership(serviceId: number, providerId: number) {
    const service = await this.serviceRepository.findOne({
      where: { serviceId },
      relations: ['provider'],
    });

    if (!service) {
      throw new NotFoundException('El servicio especificado no existe.');
    }

    if (service.provider.providerId !== providerId) {
      throw new ForbiddenException(
        'No se puede subir fotos a un servicio que no es tuyo.',
      );
    }
  }
}
