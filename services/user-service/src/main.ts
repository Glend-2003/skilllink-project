import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para que acepte peticiones del Gateway u otros orígenes
  app.enableCors();

  // CAMBIO CLAVE: Poner el puerto 3004
  await app.listen(3004);
  console.log(`🚀 User-Service corriendo en: http://localhost:3004`);
}
bootstrap();
