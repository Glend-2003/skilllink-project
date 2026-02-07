import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceRequest } from './entities/request.entity';
import { Service } from '../services/entities/service.entity';
import { CreateRequestDto } from './dto/requestCreate.dto';
import { UpdateRequestDto } from './dto/requestUpdate.dto';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(ServiceRequest)
    private readonly requestRepository: Repository<ServiceRequest>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async create(createRequestDto: CreateRequestDto, userId: number) {
    const serviceFound = await this.serviceRepository.findOne({
      where: { serviceId: createRequestDto.serviceId },
      relations: ['provider'],
    });

    if (!serviceFound) {
      throw new NotFoundException(
        `El servicio con ID ${createRequestDto.serviceId} no existe.`,
      );
    }

    if (!serviceFound.provider) {
      throw new BadRequestException(
        'El servicio seleccionado no tiene un proveedor asignado (Error de datos).',
      );
    }

    const newRequest = this.requestRepository.create({
      ...createRequestDto,
      clientUserId: userId,
      providerId: serviceFound.provider.providerId,
      status: 'pending',
      estimatedCost: serviceFound.basePrice,
    });

    // Add relations
    return await this.requestRepository.save(newRequest);
  }

  async findAll() {
    return this.requestRepository.find({
      relations: ['service', 'service.category', 'provider'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllByClient(userId: number, categoryId?: number) {
    const query = this.requestRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.service', 'service')
      .leftJoinAndSelect('service.category', 'category')
      .leftJoinAndSelect('request.provider', 'provider')
      .leftJoinAndSelect('request.review', 'review')
      .where('request.clientUserId = :userId', { userId })
      .orderBy('request.createdAt', 'DESC');

    if (categoryId) {
      query.andWhere('service.categoryId = :categoryId', { categoryId });
    }

    return await query.getMany();
  }

  async findOne(id: number) {
    const request = await this.requestRepository.findOne({
      where: { requestId: id },
      relations: ['service', 'service.category', 'provider'],
    });
    if (!request) throw new NotFoundException('Solicitud no encontrada');
    return request;
  }

  async findAllByProvider(providerId: number) {
    return this.requestRepository.find({
      where: { providerId },
      relations: ['service', 'service.category'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: number, updateRequestDto: UpdateRequestDto) {
    const request = await this.findOne(id);
    const updateData: Partial<ServiceRequest> = { ...updateRequestDto };

    if (
      updateRequestDto.status === 'completed' &&
      request.status !== 'completed'
    ) {
      updateData.completedAt = new Date();
    }

    await this.requestRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.requestRepository.update(id, { status: 'cancelled' });
    return { message: 'Solicitud cancelada con éxito', id };
  }
}
