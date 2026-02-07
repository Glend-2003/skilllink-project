import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfile } from './user-profile/user-profile.entity';
import { UserProfileModule } from './user-profile/user-profile.module';
import { SavedSearch } from './user-profile/entities/saved-search.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host:'mysql_db',
      port: 3306,
      username: 'root',
      password: '',
      database: 'skilllink_db',
      entities: [UserProfile, SavedSearch],
      synchronize: true,
    }),
    UserProfileModule,
  ],

  controllers: [], 
  providers: [],
})
export class AppModule {}