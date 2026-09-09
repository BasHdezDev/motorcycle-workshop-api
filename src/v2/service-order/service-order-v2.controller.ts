import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ServiceOrderService } from '../../service-order/service-order.service';
import { CreateServiceOrderDto } from '../../service-order/dto/create-service-order.dto/create-service-order.dto';
import { UpdateServiceOrderDto } from '../../service-order/dto/update-service-order.dto/update-service-order.dto';
import { ChangeStatusDto } from '../../service-order/dto/change-status.dto/change-status.dto';
import { QueryServiceOrderDto } from '../../service-order/dto/query-service-order.dto/query-service-order.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto/pagination-query.dto';
import { ApiKeyGuard } from '../common/api-key.guard';

@Controller('api/v2/service-orders')
@UseGuards(ApiKeyGuard)
export class ServiceOrderV2Controller {
    constructor(private readonly serviceOrderService: ServiceOrderService) { }

    @Get()
    findAll(@Query() pagination: PaginationQueryDto) {
        return this.serviceOrderService.findAll(pagination);
    }

    @Get('query')
    query(@Query() filters: QueryServiceOrderDto) {
        return this.serviceOrderService.search(filters);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.serviceOrderService.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateServiceOrderDto) {
        return this.serviceOrderService.create(dto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateServiceOrderDto) {
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