import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/serviceCreate.dto';
import { UpdateServiceDto } from './dto/serviceUpdate.dto';

import { ProviderProfile } from '../providers/entities/provider.entity';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(ProviderProfile)
    private readonly providerProfile: Repository<ProviderProfile>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createServiceDto: CreateServiceDto) {
    // Validate if ProviderProfile exists
    const provider = await this.providerProfile.findOne({
      where: {
        providerId: createServiceDto.providerId,
      },
    });
    if (!provider) {
      throw new NotFoundException(
        `Proveedor con el ID ${createServiceDto.providerId} no encontrado`,
      );
    }
    // Validate if Category exists
    const category = await this.categoryRepository.findOne({
      where: {
        categoryId: createServiceDto.categoryId,
      },
    });
    if (!category) {
      throw new NotFoundException(
        `Categoria con el ID ${createServiceDto.categoryId} no encontrada`,
      );
    }

    // If both exist, proceed to create the service
    const service = this.serviceRepository.create(createServiceDto);
    return await this.serviceRepository.save(service);
  }

  async update(id: number, updateServiceDto: UpdateServiceDto) {
    await this.findOne(id);

    // If the user is trying to change the Provider, validate the new one exists
    if (updateServiceDto.providerId) {
      const provider = await this.providerProfile.findOne({
        where: { providerId: updateServiceDto.providerId },
      });
      if (!provider)
        throw new NotFoundException(
          `Nuevo Proveedor con ID ${updateServiceDto.providerId} no encontrado`,
        );
    }

    // If the user is trying to change the Category, validate the new one exists
    if (updateServiceDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { categoryId: updateServiceDto.categoryId },
      });
      if (!category)
        throw new NotFoundException(
          `Nueva Categoria con ID ${updateServiceDto.categoryId} no encontrada`,
        );
    }

    await this.serviceRepository.update(id, updateServiceDto);
    return this.findOne(id);
  }

  async findAll() {
    const services = await this.serviceRepository.find({
      where: {
        approvalStatus: 'approved',
        isActive: true,
      },
      relations: {
        provider: {
          user: true,
        },
        category: true,
        gallery: true,
      },
    });

    // Calculate average rating for each service based on provider's reviews
    const servicesWithRating = await Promise.all(
      services.map(async (service) => {
        const result = await this.serviceRepository.query(
          `
          SELECT 
            COALESCE(AVG(r.rating), 0) as avgRating,
            COUNT(r.review_id) as reviewCount
          FROM services s
          INNER JOIN provider_profiles pp ON s.provider_id = pp.provider_id
          LEFT JOIN reviews r ON r.reviewed_user_id = pp.user_id
          WHERE s.service_id = ?
          GROUP BY s.service_id
          `,
          [service.serviceId],
        );

        const rating = result[0]?.avgRating 
          ? parseFloat(result[0].avgRating) 
          : null;
        const reviewCount = result[0]?.reviewCount || 0;

        return {
          ...service,
          rating,
          reviewCount,
        };
      }),
    );

    return servicesWithRating;
  }

  async findOne(id: number) {
    const service = await this.serviceRepository.findOne({
      where: { serviceId: id },
      relations: {
        provider: {
          user: true,
        },
        category: true,
        gallery: true,
      },
    });
    if (!service) throw new NotFoundException('Servicio no encontrado');

    // Calculate average rating based on provider's reviews
    const result = await this.serviceRepository.query(
      `
      SELECT 
        COALESCE(AVG(r.rating), 0) as avgRating,
        COUNT(r.review_id) as reviewCount
      FROM services s
      INNER JOIN provider_profiles pp ON s.provider_id = pp.provider_id
      LEFT JOIN reviews r ON r.reviewed_user_id = pp.user_id
      WHERE s.service_id = ?
      GROUP BY s.service_id
      `,
      [id],
    );

    const rating = result[0]?.avgRating 
      ? parseFloat(result[0].avgRating) 
      : null;
    const reviewCount = result[0]?.reviewCount || 0;

    return {
      ...service,
      rating,
      reviewCount,
    };
  }

  async findByProvider(providerId: number) {
    // Validate if ProviderProfile exists
    const provider = await this.providerProfile.findOne({
      where: { providerId },
    });
    if (!provider) {
      throw new NotFoundException(
        `Proveedor con el ID ${providerId} no encontrado`,
      );
    }

    // Only return approved and active services for public viewing
    const services = await this.serviceRepository.find({
      where: { 
        providerId,
        approvalStatus: 'approved',
        isActive: true,
      },
      relations: {
        category: true,
        provider: {
          user: true,
        },
        gallery: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    // Calculate average rating for each service based on provider's reviews
    const servicesWithRating = await Promise.all(
      services.map(async (service) => {
        const result = await this.serviceRepository.query(
          `
          SELECT 
            COALESCE(AVG(r.rating), 0) as avgRating,
            COUNT(r.review_id) as reviewCount
          FROM services s
          INNER JOIN provider_profiles pp ON s.provider_id = pp.provider_id
          LEFT JOIN reviews r ON r.reviewed_user_id = pp.user_id
          WHERE s.service_id = ?
          GROUP BY s.service_id
          `,
          [service.serviceId],
        );

        const rating = result[0]?.avgRating 
          ? parseFloat(result[0].avgRating) 
          : null;
        const reviewCount = result[0]?.reviewCount || 0;

        return {
          ...service,
          rating,
          reviewCount,
        };
      }),
    );

    return servicesWithRating;
  }

  async findByUserId(userId: number) {
    // Find the provider profile for this user
    const provider = await this.providerProfile.findOne({
      where: { userId },
    });
    
    if (!provider) {
      throw new NotFoundException(
        `No se encontró perfil de proveedor para el usuario ${userId}`,
      );
    }

    // Return ALL services for the provider (including pending and rejected)
    // This is used by the authenticated provider to see their own services
    const services = await this.serviceRepository.find({
      where: { providerId: provider.providerId },
      relations: {
        category: true,
        provider: {
          user: true,
        },
        gallery: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    // Calculate average rating for each service based on provider's reviews
    const servicesWithRating = await Promise.all(
      services.map(async (service) => {
        const result = await this.serviceRepository.query(
          `
          SELECT 
            COALESCE(AVG(r.rating), 0) as avgRating,
            COUNT(r.review_id) as reviewCount
          FROM services s
          INNER JOIN provider_profiles pp ON s.provider_id = pp.provider_id
          LEFT JOIN reviews r ON r.reviewed_user_id = pp.user_id
          WHERE s.service_id = ?
          GROUP BY s.service_id
          `,
          [service.serviceId],
        );

        const rating = result[0]?.avgRating 
          ? parseFloat(result[0].avgRating) 
          : null;
        const reviewCount = result[0]?.reviewCount || 0;

        return {
          ...service,
          rating,
          reviewCount,
        };
      }),
    );

    return servicesWithRating;
  }

  async remove(id: number) {
    const service = await this.findOne(id);
    await this.serviceRepository.remove(service);
    return { deleted: true, id };
  }

  // Method to verify a service by admin
  async verifyService(id: number) {
    const service = await this.findOne(id);
    service.isVerified = !service.isVerified;
    service.verificationDate = service.isVerified ? new Date() : null;
    await this.serviceRepository.save(service);
    return this.findOne(id);
  }

  // Admin methods for service approval
  async findPending() {
    const services = await this.serviceRepository.find({
      where: { approvalStatus: 'pending' },
      relations: {
        provider: {
          user: true,
        },
        category: true,
        gallery: true,
      },
      order: {
        createdAt: 'ASC',
      },
    });

    // Calculate average rating for each service
    const servicesWithRating = await Promise.all(
      services.map(async (service) => {
        const result = await this.serviceRepository.query(
          `
          SELECT 
            COALESCE(AVG(r.rating), 0) as avgRating,
            COUNT(r.review_id) as reviewCount
          FROM services s
          INNER JOIN provider_profiles pp ON s.provider_id = pp.provider_id
          LEFT JOIN reviews r ON r.reviewed_user_id = pp.user_id
          WHERE s.service_id = ?
          GROUP BY s.service_id
          `,
          [service.serviceId],
        );

        const rating = result[0]?.avgRating 
          ? parseFloat(result[0].avgRating) 
          : null;
        const reviewCount = result[0]?.reviewCount || 0;

        return {
          ...service,
          rating,
          reviewCount,
        };
      }),
    );

    return servicesWithRating;
  }

  async findAllForAdmin() {
    const services = await this.serviceRepository.find({
      relations: {
        provider: {
          user: true,
        },
        category: true,
        gallery: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    // Calculate average rating for each service
    const servicesWithRating = await Promise.all(
      services.map(async (service) => {
        const result = await this.serviceRepository.query(
          `
          SELECT 
            COALESCE(AVG(r.rating), 0) as avgRating,
            COUNT(r.review_id) as reviewCount
          FROM services s
          INNER JOIN provider_profiles pp ON s.provider_id = pp.provider_id
          LEFT JOIN reviews r ON r.reviewed_user_id = pp.user_id
          WHERE s.service_id = ?
          GROUP BY s.service_id
          `,
          [service.serviceId],
        );

        const rating = result[0]?.avgRating 
          ? parseFloat(result[0].avgRating) 
          : null;
        const reviewCount = result[0]?.reviewCount || 0;

        return {
          ...service,
          rating,
          reviewCount,
        };
      }),
    );

    return servicesWithRating;
  }

  async approveService(id: number) {
    const service = await this.findOne(id);
    service.approvalStatus = 'approved';
    service.isActive = true;
    service.isVerified = true;
    service.verificationDate = new Date();
    await this.serviceRepository.save(service);
    return this.findOne(id);
  }

  async rejectService(id: number, reason?: string) {
    const service = await this.findOne(id);
    service.approvalStatus = 'rejected';
    service.isActive = false;
    await this.serviceRepository.save(service);
    return this.findOne(id);
  }
}
