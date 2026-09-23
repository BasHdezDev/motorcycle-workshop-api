import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InteropController } from './interop/interop.controller';
import { MetricsController } from './interop/metrics.controller';
import { HealthController } from './health/health.controller';
import { FlujoService } from './flujo/flujo.service';
import { ConsumerService } from './flujo/consumer.service';
import { MetricsModule } from './metrics/metrics.module';
import { FlujoController } from './flujo/flujo.controler';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MetricsModule,
  ],
  controllers: [InteropController, MetricsController, FlujoController, HealthController],
  providers: [FlujoService, ConsumerService],
})
export class AppModule { }