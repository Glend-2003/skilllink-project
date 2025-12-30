import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProviderProfile } from './entities/provider.entity';
import { CreateProviderDto } from './dto/providerCreate.dto';
import { UpdateProviderDto } from './dto/providerUpdate.dto';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(ProviderProfile)
    private providerRepository: Repository<ProviderProfile>,
  ) {}

  // Public Methods

  async create(createProviderDto: CreateProviderDto) {
    const existing = await this.providerRepository.findOne({
      where: { userId: createProviderDto.userId },
    });

    if (existing) {
      throw new ConflictException(
        `El usuario ID ${createProviderDto.userId} ya es proveedor.`,
      );
    }

    const provider = this.providerRepository.create(createProviderDto);
    return await this.providerRepository.save(provider);
  }

  async findAll() {
    return await this.providerRepository.find();
  }

  async findOne(id: number) {
    const provider = await this.providerRepository.findOne({
      where: { providerId: id },
    });
    if (!provider)
      throw new NotFoundException(`Proveedor #${id} no encontrado`);
    return provider;
  }

  async findByUserId(userId: number) {
    const provider = await this.providerRepository.findOne({
      where: { userId },
    });
    if (!provider)
      throw new NotFoundException(`Usuario ${userId} no es proveedor`);
    return provider;
  }

  async update(id: number, updateProviderDto: UpdateProviderDto) {
    const provider = await this.providerRepository.preload({
      providerId: id,
      ...updateProviderDto,
    });
    if (!provider)
      throw new NotFoundException(`Proveedor #${id} no encontrado`);
    return await this.providerRepository.save(provider);
  }

  async remove(id: number) {
    const provider = await this.findOne(id);
    return await this.providerRepository.remove(provider);
  }

  // Private Internal Methods

  // Verify Provider
  async verifyProvider(id: number) {
    const provider = await this.findOne(id);
    provider.isVerified = true;
    provider.verificationDate = new Date(); // exact timestamp
    return await this.providerRepository.save(provider);
  }

  // give or remove trust badge
  async toggleTrustBadge(id: number) {
    const provider = await this.findOne(id);
    provider.trustBadge = !provider.trustBadge; // invert current state
    return await this.providerRepository.save(provider);
  }
}
