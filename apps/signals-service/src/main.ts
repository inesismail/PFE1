import { NestFactory } from '@nestjs/core';
import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Signals Service')
    .setDescription('EDF signal ingestion & site limit management')
    .setVersion('1.0')
    .build();

  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));

  const port = process.env.PORT || 3004;
  await app.listen(port);
  console.log(`[SignalsService] Running on http://localhost:${port}/api`);
  console.log(`[SignalsService] Swagger: http://localhost:${port}/api/docs`);
}
bootstrap();