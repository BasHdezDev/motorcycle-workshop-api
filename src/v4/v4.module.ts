import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ServiceOrderModule } from '../service-order/service-order.module';
import { HealthV4Controller } from './health/health-v4.controller';
import { ServiceOrderV4Controller } from './service-order/service-order-v4.controller';
import { ServiceOrderV4Service } from './service-order/service-order-v4.service';

@Module({
    imports: [PrismaModule, ServiceOrderModule],
    controllers: [HealthV4Controller, ServiceOrderV4Controller],
    providers: [ServiceOrderV4Service],
})
export class V4Module { }