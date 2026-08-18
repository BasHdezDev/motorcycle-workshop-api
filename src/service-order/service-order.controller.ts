import { Body, Controller, Post } from '@nestjs/common';
import { ServiceOrderService } from './service-order.service.js';
import { CreateServiceOrderDto } from './dto/create-service-order.dto/create-service-order.dto';

@Controller('service-orders')
export class ServiceOrderController {
  constructor(private readonly serviceOrderService: ServiceOrderService) {}

  @Post()
  create(@Body() dto: CreateServiceOrderDto) {
    return this.serviceOrderService.create(dto);
  }
}