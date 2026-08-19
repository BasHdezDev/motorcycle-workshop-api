import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceOrderService } from './service-order.service.js';
import { CreateServiceOrderDto } from './dto/create-service-order.dto/create-service-order.dto';
import { UpdateServiceOrderDto } from './dto/update-service-order.dto/update-service-order.dto';
import { ChangeStatusDto } from './dto/change-status.dto/change-status.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto/pagination-query.dto';

@ApiTags('service-orders')
@Controller('service-orders')
export class ServiceOrderController {
    constructor(private readonly serviceOrderService: ServiceOrderService) { }

    @Post()
    @ApiOperation({ summary: 'Open a new service order (fails if the motorcycle already has an active order)' })
    create(@Body() dto: CreateServiceOrderDto) {
        return this.serviceOrderService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'List all service orders (paginated)' })
    findAll(@Query() pagination: PaginationQueryDto) {
        return this.serviceOrderService.findAll(pagination);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a service order by id' })
    findOne(@Param('id') id: string) {
        return this.serviceOrderService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update plain fields (diagnosis, cost, payment, etc.) — blocked on terminal-state orders' })
    update(@Param('id') id: string, @Body() dto: UpdateServiceOrderDto) {
        return this.serviceOrderService.update(id, dto);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Advance the order to the next status in the RECEIVED → UNDER_DIAGNOSIS → UNDER_REPAIR → READY → DELIVERED chain' })
    changeStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto) {
        return this.serviceOrderService.changeStatus(id, dto);
    }

    @Patch(':id/cancel')
    @ApiOperation({ summary: 'Cancel an order (only allowed while RECEIVED or UNDER_DIAGNOSIS)' })
    cancel(@Param('id') id: string) {
        return this.serviceOrderService.cancel(id);
    }
}