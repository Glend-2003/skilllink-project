import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfile } from './user-profile.entity';
import { UserProfileService } from './user-profile.service';
import { UserProfileController } from './user-profile.controller'; // <--- Importado
import { JwtStrategy } from './jwt.strategy'; // <--- Importado
import { PassportModule } from '@nestjs/passport'; // <--- Importado

@Module({
  imports: [
    TypeOrmModule.forFeature([UserProfile]),
    PassportModule, // <--- Necesario para AuthGuard
  ],
  controllers: [UserProfileController], // <--- Registramos el controlador
  providers: [UserProfileService, JwtStrategy], // <--- Registramos la estrategia como Provider
  exports: [UserProfileService],
})
export class UserProfileModule {}
