import { Module } from '@nestjs/common';
import { MotorcycleController } from './motorcycle.controller';
import { MotorcycleService } from './motorcycle.service';

@Module({
  controllers: [MotorcycleController],
  providers: [MotorcycleService],
  exports: [MotorcycleService],
})
export class MotorcycleModule {}