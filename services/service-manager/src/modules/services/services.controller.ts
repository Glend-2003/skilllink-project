import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';

import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/serviceCreate.dto';
import { UpdateServiceDto } from './dto/serviceUpdate.dto';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(createServiceDto);
  }

  @Get()
  findAll() {
    return this.servicesService.findAll();
  }

  @Get('provider/:providerId')
  findByProvider(@Param('providerId', ParseIntPipe) providerId: number) {
    return this.servicesService.findByProvider(providerId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.servicesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return this.servicesService.update(id, updateServiceDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.servicesService.remove(id);
  }

  // Endpoint to verify a service by admin
  @Patch(':id/verify')
  verify(@Param('id', ParseIntPipe) id: number) {
    return this.servicesService.verifyService(id);
  }

  // Admin endpoints
  @Get('admin/pending')
  async findPending() {
    const services = await this.servicesService.findPending();
    return services.map(service => ({
      ...service,
      providerBusinessName: service.provider?.businessName || 'Sin nombre',
      providerEmail: service.provider?.user?.email || 'Sin email',
      categoryName: service.category?.categoryName || 'Sin categoría',
    }));
  }

  @Get('admin/all')
  async findAllForAdmin() {
    const services = await this.servicesService.findAllForAdmin();
    return services.map(service => ({
      ...service,
      providerBusinessName: service.provider?.businessName || 'Sin nombre',
      providerEmail: service.provider?.user?.email || 'Sin email',
      categoryName: service.category?.categoryName || 'Sin categoría',
    }));
  }

  @Patch('admin/:id/approve')
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.servicesService.approveService(id);
  }

  @Patch('admin/:id/reject')
  reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { reason?: string },
  ) {
    return this.servicesService.rejectService(id, body.reason);
  }
}
