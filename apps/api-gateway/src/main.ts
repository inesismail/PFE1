// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // ← FIX : empêche NestJS de consommer le stream avant le proxy
  });

  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  const port = Number(process.env.PORT || 3002);
  await app.listen(port);
  console.log(`[GATEWAY] http://localhost:${port}`);
}
bootstrap();
