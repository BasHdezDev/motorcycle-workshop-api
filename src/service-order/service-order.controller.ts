import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ServiceOrderService } from './service-order.service.js';
import { CreateServiceOrderDto } from './dto/create-service-order.dto/create-service-order.dto';

@Controller('service-orders')
export class ServiceOrderController {
  constructor(private readonly serviceOrderService: ServiceOrderService) {}

  @Post()
  create(@Body() dto: CreateServiceOrderDto) {
    return this.serviceOrderService.create(dto);
  }

  @Get()
  findAll() {
    return this.serviceOrderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceOrderService.findOne(id);
  }
}