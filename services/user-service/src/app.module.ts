import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfile } from './user-profile/user-profile.entity';
import { UserProfileModule } from './user-profile/user-profile.module';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host:'mysql_db',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'skilllink_db',
      entities: [UserProfile],
      synchronize: true,
    }),
    UserProfileModule,
  ],

  controllers: [], 
  providers: [],
})
export class AppModule {}