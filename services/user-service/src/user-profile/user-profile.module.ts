import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfile } from './user-profile.entity';
import { UserProfileService } from './user-profile.service';
import { UserProfileController } from './user-profile.controller';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { SavedSearch } from './entities/saved-search.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserProfile, SavedSearch]),
    PassportModule,
  ],
  controllers: [UserProfileController],
  providers: [UserProfileService, JwtStrategy],
  exports: [UserProfileService],
})
export class UserProfileModule {}
