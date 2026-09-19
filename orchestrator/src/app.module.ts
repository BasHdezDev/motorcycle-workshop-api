import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InteropController } from './interop/interop.controller';
import { MetricsController } from './interop/metrics.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [InteropController, MetricsController],
})
export class AppModule { }