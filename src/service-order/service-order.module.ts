import { Module } from '@nestjs/common';

import { ServiceOrderController } from './service-order.controller';
import { ServiceOrderService } from './service-order.service';
import { MetricsModule } from '../metrics/metrics.module';

@Module({
  imports: [MetricsModule],
  controllers: [ServiceOrderController],
  providers: [
    ServiceOrderService,
  ],
  exports: [ServiceOrderService],
})
export class ServiceOrderModule { }