// app.module.ts
import { Module } from '@nestjs/common';
import { ProxyController } from './proxy/proxy.controller';

@Module({
  imports: [],
  controllers: [ProxyController],
  providers: [],
})
export class AppModule {}