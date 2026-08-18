import { Body, Controller, Get, Param, Post, Patch } from '@nestjs/common';
import { ServiceOrderService } from './service-order.service.js';
import { CreateServiceOrderDto } from './dto/create-service-order.dto/create-service-order.dto';
import { UpdateServiceOrderDto } from './dto/update-service-order.dto/update-service-order.dto.js';
import { ChangeStatusDto } from './dto/change-status.dto/change-status.dto.js';

@Controller('service-orders')
export class ServiceOrderController {
    constructor(private readonly serviceOrderService: ServiceOrderService) { }

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

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateServiceOrderDto) {
        return this.serviceOrderService.update(id, dto);
    }

    @Patch(':id/status')
    changeStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto) {
        return this.serviceOrderService.changeStatus(id, dto);
    }
}