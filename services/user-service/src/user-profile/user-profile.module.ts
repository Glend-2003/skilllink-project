import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfile } from './user-profile.entity';
import { UserProfileService } from './user-profile.service';
import { UserProfileController } from './user-profile.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { SavedSearch } from './entities/saved-search.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserProfile, SavedSearch]),
    PassportModule,
    JwtModule.register({
      secret: 'SkillLink_Super_Secret_Key_2025_Unica',
      signOptions: { expiresIn: '30d' },
    }),
  ],
  controllers: [UserProfileController],
  providers: [UserProfileService],
  exports: [UserProfileService],
})
export class UserProfileModule {}
