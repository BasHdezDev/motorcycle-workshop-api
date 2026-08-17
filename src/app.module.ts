import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { DriverModule } from './driver/driver.module';
import { MotorcycleModule } from './motorcycle/motorcycle.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  }),
    PrismaModule,
    DriverModule,
    MotorcycleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
