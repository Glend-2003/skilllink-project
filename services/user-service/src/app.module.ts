import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserProfile } from './user-profile/user-profile.entity';
import { UserProfileModule } from './user-profile/user-profile.module';
import { SavedSearch } from './user-profile/entities/saved-search.entity';
import { JwtStrategy } from './user-profile/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host:'mysql_db',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'skilllink_db',
      entities: [UserProfile, SavedSearch],
      synchronize: true,
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'SkillLink_Super_Secret_Key_2025_Unica',
      signOptions: { expiresIn: '30d' },
    }),
    UserProfileModule,
  ],

  controllers: [], 
  providers: [JwtStrategy],
})
export class AppModule {}