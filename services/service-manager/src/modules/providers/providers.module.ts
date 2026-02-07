import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProvidersService } from './providers.service';
import { ProvidersController } from './providers.controller';
import { ProviderProfile } from './entities/provider.entity';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProviderProfile, User])],
  controllers: [ProvidersController],
  providers: [ProvidersService],
  exports: [ProvidersService],
})
export class ProvidersModule {}
