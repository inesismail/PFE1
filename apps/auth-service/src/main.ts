import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Flexee — Auth Service')
    .setDescription('Authentication, users & password reset')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));

  const server = app.getHttpAdapter().getInstance();
  server.get('/health', (_req: import('express').Request, res: import('express').Response) => res.json({ status: 'ok' }));

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Auth Service running on http://localhost:${port}/api`);
  console.log(`Swagger: http://localhost:${port}/api/docs`);
}
bootstrap();