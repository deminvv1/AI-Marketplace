import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet({
    crossOriginEmbedderPolicy: false,  // needed for Socket.io
    contentSecurityPolicy: false,      // CSP managed by Next.js
  }));

  const corsOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',').map((o) => o.trim())
    : ['http://localhost:3000', 'http://localhost:3001'];

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT || 4000);
  console.log(`Server running on http://localhost:${process.env.PORT || 4000}/api`);
}

bootstrap();
