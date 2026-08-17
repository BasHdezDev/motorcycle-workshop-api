import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { DriverModule } from './driver/driver.module';
import { MotorcycleModule } from './motorcycle/motorcycle.module';
import { ServiceOrderModule } from './service-order/service-order.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  }),
    PrismaModule,
    DriverModule,
    MotorcycleModule,
    ServiceOrderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
