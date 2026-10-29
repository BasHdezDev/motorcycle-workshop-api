import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ServiceOrderService } from '../../service-order/service-order.service';
import { ChangeStatusDto } from '../../service-order/dto/change-status.dto/change-status.dto';
import { ApiKeyGuard } from '../../v2/common/api-key.guard';
import { ServiceOrderV4Service } from './service-order-v4.service';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
    CreateServiceOrderV4Dto,
    QueryServiceOrderV4Dto,
    UpdateServiceOrderV4Dto,
} from './dto/service-order-v4.dto';


@ApiTags('v4-service-orders')
@ApiSecurity('api-key')
@Controller('api/v4/service-orders')
@UseGuards(ApiKeyGuard)
export class ServiceOrderV4Controller {
    constructor(
        private readonly serviceOrderService: ServiceOrderService,
        private readonly serviceOrderV4Service: ServiceOrderV4Service,
    ) { }

    @Get()
    findAll(@Query() query: QueryServiceOrderV4Dto) {
        return this.serviceOrderV4Service.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.serviceOrderService.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateServiceOrderV4Dto) {
        return this.serviceOrderService.create(dto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateServiceOrderV4Dto) {
        return this.serviceOrderService.update(id, dto);
    }

    @Patch(':id/status')
    changeStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto) {
        return this.serviceOrderService.changeStatus(id, dto);
    }

    @Patch(':id/cancel')
    cancel(@Param('id') id: string) {
        return this.serviceOrderService.cancel(id);
    }
}