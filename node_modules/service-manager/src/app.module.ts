import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoriesModule } from './modules/categories/categories.module';
import { ProvidersModule } from './modules/providers/providers.module';
import { ServicesModule } from './modules/services/services.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'skilllink_db',
      autoLoadEntities: true,
      synchronize: false,
    }),

    CategoriesModule,
    ProvidersModule,
    ServicesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
