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

import { ProvidersService } from './providers.service';
import { CreateProviderDto } from './dto/providerCreate.dto';
import { UpdateProviderDto } from './dto/providerUpdate.dto';

@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  // Public Endpoints

  @Post()
  create(@Body() createProviderDto: CreateProviderDto) {
    return this.providersService.create(createProviderDto);
  }

  @Get()
  findAll() {
    return this.providersService.findAll();
  }

    
  //Get active providers
  @Get('active')
  async getActiveProviders() {
    return await this.providersService.findProvidersByStatus(true);
  }

  //Get inactive providers
  @Get('inactive')
  async getInactiveProviders() {
    return await this.providersService.findProvidersByStatus(false);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.providersService.findOne(id);
  }

  @Get('user/:userId')
  findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.providersService.findByUserId(userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProviderDto: UpdateProviderDto,
  ) {
    return this.providersService.update(id, updateProviderDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.providersService.remove(id);
  }

  // Private Admin Endpoints

  @Patch(':id/verify')
  verifyProvider(@Param('id', ParseIntPipe) id: number) {
    return this.providersService.verifyProvider(id);
  }

  @Patch(':id/trust-badge')
  toggleTrustBadge(@Param('id', ParseIntPipe) id: number) {
    return this.providersService.toggleTrustBadge(id);
  }

}
