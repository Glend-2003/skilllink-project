import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// 1. IMPORTANTE: Traemos el módulo de categorías
import { CategoriesModule } from './modules/categories/categories.module';

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
      synchronize: true,
    }),

    CategoriesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
