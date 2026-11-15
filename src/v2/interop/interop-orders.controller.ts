import { Controller, Get, NotFoundException, Req, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { ServiceOrderService } from '../../service-order/service-order.service';
import { ApiKeyGuard } from '../common/api-key.guard';
import { CorrelationIdGuard } from './correlation-id.guard';

@ApiExcludeController()
@Controller('api/v2/interop')
@UseGuards(CorrelationIdGuard, ApiKeyGuard)
export class InteropOrdersController {
    constructor(private readonly serviceOrderService: ServiceOrderService) { }

    @Get('orders/random')
    async random(@Req() req: FastifyRequest & { correlationId: string }) {
        const order = await this.serviceOrderService.randomForInterop(req.correlationId);
        if (!order) throw new NotFoundException('No orders available');
        return order;
    }
}