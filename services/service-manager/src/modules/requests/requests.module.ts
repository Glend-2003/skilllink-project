import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { ServiceRequest } from './entities/request.entity';
import { Service } from '../services/entities/service.entity';
import { AuthModule } from '../../config/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceRequest, Service]), AuthModule],
  controllers: [RequestsController],
  providers: [RequestsService],
  exports: [RequestsService],
})
export class RequestsModule {}
