import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
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
      where: {
        userId: createProviderDto.userId,
      },
    });

    if (existing) {
      throw new ConflictException(
        `El usuario ID ${createProviderDto.userId} ya posee un perfil de proveedor.`,
      );
    }

    try {
      const provider = this.providerRepository.create(createProviderDto);
      return await this.providerRepository.save(provider);
    } catch (error: any) {
      const dbError = error as { errno: number; code: string };
      if (dbError.errno === 1452 || dbError.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new BadRequestException(
          `Error de integridad: El userId ${createProviderDto.userId} no existe en la base de datos de usuarios.`,
        );
      }

      throw new InternalServerErrorException(
        'Error inesperado al crear el proveedor.',
      );
    }
  }

  async findAll() {
    return await this.providerRepository.find();
  }

  async findOne(id: number) {
    const provider = await this.providerRepository.findOne({
      where: { providerId: id },
    });
    if (!provider)
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
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
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
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
    provider.isVerified = !provider.isVerified;
    provider.verificationDate = provider.isVerified ? new Date() : null;
    return await this.providerRepository.save(provider);
  }

  // give or remove trust badge
  async toggleTrustBadge(id: number) {
    const provider = await this.providerRepository.preload({
      providerId: id,
    });

    if (!provider)
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);

    provider.trustBadge = !provider.trustBadge;
    return await this.providerRepository.save(provider);
  }

  async findProvidersByStatus(active: boolean) {
    const providerRoleId = 2;

    return await this.providerRepository
      .createQueryBuilder('profile')
      .innerJoin('users', 'user', 'user.user_id = profile.user_id')
      .innerJoin('user_roles', 'ur', 'ur.user_id = user.user_id')
      .where('ur.role_id = :roleId', { roleId: providerRoleId })
      .andWhere('ur.is_active = :status', { status: active ? 1 : 0 })
      .select([
        'profile.user_id AS userId',
        'profile.first_name AS firstName',
        'profile.last_name AS lastName',
        'user.email AS email',
        'ur.is_active AS isActive'
      ])
      .getRawMany();
  }
}
