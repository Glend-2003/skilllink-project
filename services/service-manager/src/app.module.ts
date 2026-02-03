import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GalleryModule } from './modules/gallery/gallery.module';
import { ServicesModule } from './modules/services/services.module';
import { ProvidersModule } from './modules/providers/providers.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { RequestsModule } from './modules/requests/requests.module';
import { ProfileModule } from './modules/profile/profile.module';
import { AuthModule } from './config/auth.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 3306),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', ''),
        database: configService.get('DB_DATABASE', 'skilllink_db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        logging: false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    CloudinaryModule,
    GalleryModule,
    ProfileModule,
    ServicesModule,
    ProvidersModule,
    CategoriesModule,
    RequestsModule,
  ],
})
export class AppModule {}
