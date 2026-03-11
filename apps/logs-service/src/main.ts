import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('LogsService');
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: '*' });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Flexee — Logs Service')
    .setDescription('Centralise les SystemLog de tous les microservices')
    .setVersion('1.0')
    .addTag('Logs')
    .build();

  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));

  const port = process.env.PORT ?? 3007;
  await app.listen(port);
  logger.log(`Logs Service démarré sur http://localhost:${port}/api`);
}

bootstrap();