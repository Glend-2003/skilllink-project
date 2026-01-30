import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfile } from './user-profile.entity';
import { UserProfileService } from './user-profile.service';
import { UserProfileController } from './user-profile.controller'; 
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([UserProfile]),
    PassportModule, 
  ],
  controllers: [UserProfileController],
  providers: [UserProfileService, JwtStrategy],
  exports: [UserProfileService],
})
export class UserProfileModule {}
