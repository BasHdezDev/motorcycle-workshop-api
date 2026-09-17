import { Module } from '@nestjs/common';
import { ServiceOrderController } from './service-order.controller';
import { ServiceOrderService } from './service-order.service';

@Module({
  controllers: [ServiceOrderController],
  providers: [ServiceOrderService],
  exports: [ServiceOrderService],
})
export class ServiceOrderModule {}
