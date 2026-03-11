import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('SitesService');
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: '*' });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Flexee — Sites Service')
    .setDescription('CPO Connections, EDF Regions, Sites, Signal Processor')
    .setVersion('1.0')
    .addTag('CPO Connections').addTag('EDF Regions').addTag('Sites').addTag('Signal Processor')
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));

  const port = process.env.PORT ?? 3003;
  await app.listen(port);
  logger.log(`Sites Service démarré sur http://localhost:${port}/api`);
  logger.log(`Swagger: http://localhost:${port}/api/docs`);
}

bootstrap();
