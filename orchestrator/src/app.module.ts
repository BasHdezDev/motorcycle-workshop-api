import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InteropController } from './interop/interop.controller';
import { MetricsController } from './interop/metrics.controller';
import { HealthController } from './health/health.controller';
import { FlujoService } from './flujo/flujo.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [InteropController, MetricsController, HealthController],
  providers: [FlujoService],
})
export class AppModule { }