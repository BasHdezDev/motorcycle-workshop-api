import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { DriverModule } from './driver/driver.module';
import { MotorcycleModule } from './motorcycle/motorcycle.module';
import { ServiceOrderModule } from './service-order/service-order.module';
import { HealthModule } from './health/health.module';
import { HealthV2Controller } from './v2/health/health-v2.controller';
import { DriverV2Controller } from './v2/driver/driver-v2.controller';
import { MotorcycleV2Controller } from './v2/motorcycle/motorcycle-v2.controller';
import { ServiceOrderV2Controller } from './v2/service-order/service-order-v2.controller';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  }),
    PrismaModule,
    DriverModule,
    MotorcycleModule,
    ServiceOrderModule,
    HealthModule,
  ],
  controllers: [
    AppController,
    HealthV2Controller,
    DriverV2Controller,
    MotorcycleV2Controller,
    ServiceOrderV2Controller,
  ],
  providers: [AppService],
})
export class AppModule { }
