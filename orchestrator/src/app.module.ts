import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InteropController } from './interop/interop.controller';
import { MetricsController } from './interop/metrics.controller';
import { HealthController } from './health/health.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [InteropController, MetricsController, HealthController],
})
export class AppModule { }