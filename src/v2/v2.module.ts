import { Module } from '@nestjs/common';
import { DriverModule } from '../driver/driver.module';
import { MotorcycleModule } from '../motorcycle/motorcycle.module';
import { ServiceOrderModule } from '../service-order/service-order.module';
import { HealthV2Controller } from './health/health-v2.controller';
import { DriverV2Controller } from './driver/driver-v2.controller';
import { MotorcycleV2Controller } from './motorcycle/motorcycle-v2.controller';
import { ServiceOrderV2Controller } from './service-order/service-order-v2.controller';

@Module({
    imports: [DriverModule, MotorcycleModule, ServiceOrderModule],
    controllers: [
        HealthV2Controller,
        DriverV2Controller,
        MotorcycleV2Controller,
        ServiceOrderV2Controller,
    ],
})
export class V2Module { }