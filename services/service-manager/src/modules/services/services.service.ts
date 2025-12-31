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
    return this.serviceRepository.find({
      relations: {
        provider: true,
        category: true,
      },
    });
  }

  async findOne(id: number) {
    const service = await this.serviceRepository.findOne({
      where: { serviceId: id },
      relations: {
        provider: true,
        category: true,
      },
    });
    if (!service) throw new NotFoundException('Servicio no encontrado');
    return service;
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
}
