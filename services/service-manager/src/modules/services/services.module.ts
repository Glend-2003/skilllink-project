import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { ProviderProfile } from '../providers/entities/provider.entity';
import { Category } from '../categories/entities/category.entity';
import { Gallery } from '../gallery/entities/gallery.entity';
import { AuthModule } from '../../config/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Service, ProviderProfile, Category, Gallery]),
    AuthModule,
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
})
export class ServicesModule {}
