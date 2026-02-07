import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review } from './entities/review.entity';
import { ServiceRequest } from '../requests/entities/request.entity';
import { ProviderProfile } from '../providers/entities/provider.entity';
import { AuthModule } from 'src/config/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, ServiceRequest, ProviderProfile]),
    AuthModule, 
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}