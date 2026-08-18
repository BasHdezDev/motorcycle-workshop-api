import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceOrderDto } from './dto/create-service-order.dto/create-service-order.dto';
import { Prisma, ServiceOrderStatus } from '../../generated/prisma/client.js';
import { UpdateServiceOrderDto } from './dto/update-service-order.dto/update-service-order.dto';
import { ChangeStatusDto } from './dto/change-status.dto/change-status.dto';
import { QueryServiceOrderDto } from './dto/query-service-order.dto/query-service-order.dto';

// Statuses that count as "active" for the one-active-order-per-motorcycle rule .
// This is per Bussiness Rule 1: "A motorcycle can have only one active service order at a time."
const ACTIVE_STATUSES: ServiceOrderStatus[] = [
    'RECEIVED',
    'UNDER_DIAGNOSIS',
    'UNDER_REPAIR',
    'READY',
];

const ALLOWED_TRANSITIONS: Record<ServiceOrderStatus, ServiceOrderStatus[]> = {
    RECEIVED: ['UNDER_DIAGNOSIS'],
    UNDER_DIAGNOSIS: ['UNDER_REPAIR'],
    UNDER_REPAIR: ['READY'],
    READY: ['DELIVERED'],
    DELIVERED: [],
    CANCELLED: [],
};

@Injectable()
export class ServiceOrderService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateServiceOrderDto) {
        const motorcycle = await this.prisma.motorcycle.findUnique({
            where: { id: dto.motorcycleId },
        });
        if (!motorcycle) {
            throw new NotFoundException(`Motorcycle ${dto.motorcycleId} not found`);
        }

        const activeOrder = await this.prisma.serviceOrder.findFirst({
            where: {
                motorcycleId: dto.motorcycleId,
                status: { in: ACTIVE_STATUSES },
            },
        });
        if (activeOrder) {
            throw new ConflictException(
                `Motorcycle ${dto.motorcycleId} already has an active service order (${activeOrder.orderNumber})`,
            );
        }

        try {
            return await this.prisma.serviceOrder.create({ data: dto });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                const field = (error.meta?.target as string[])?.join(', ');
                throw new ConflictException(`${field} already in use`);
            }
            throw error;
        }
    }

    findAll() {
        return this.prisma.serviceOrder.findMany();
    }

    async findOne(id: string) {
        const serviceOrder = await this.prisma.serviceOrder.findUnique({
            where: { id },
        });
        if (!serviceOrder) {
            throw new NotFoundException(`ServiceOrder ${id} not found`);
        }
        return serviceOrder;
    }

    async update(id: string, dto: UpdateServiceOrderDto) {
        const order = await this.findOne(id);

        if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
            throw new BadRequestException(
                `Cannot update an order in a terminal state (${order.status})`,
            );
        }

        return this.prisma.serviceOrder.update({ where: { id }, data: dto });
    }

    async changeStatus(id: string, dto: ChangeStatusDto) {
        const order = await this.findOne(id);
        const { status: nextStatus } = dto;

        const allowedNext = ALLOWED_TRANSITIONS[order.status];
        if (!allowedNext.includes(nextStatus)) {
            throw new BadRequestException(
                `Cannot transition from ${order.status} to ${nextStatus}`,
            );
        }

        if (nextStatus === 'DELIVERED') {
            if (order.repairCost === null) {
                throw new BadRequestException(
                    'Cannot mark as DELIVERED: repairCost has not been set',
                );
            }
            if (!order.paymentCompleted) {
                throw new BadRequestException(
                    'Cannot mark as DELIVERED: payment has not been completed',
                );
            }
        }

        return this.prisma.serviceOrder.update({
            where: { id },
            data: {
                status: nextStatus,
                ...(nextStatus === 'DELIVERED' ? { checkOutDate: new Date() } : {}),
            },
        });
    }

    async cancel(id: string) {
        const order = await this.findOne(id);

        const cancellableStatuses: ServiceOrderStatus[] = [
            'RECEIVED',
            'UNDER_DIAGNOSIS',
        ];
        if (!cancellableStatuses.includes(order.status)) {
            throw new BadRequestException(
                `Cannot cancel an order in status ${order.status}. Only RECEIVED or UNDER_DIAGNOSIS orders can be cancelled.`,
            );
        }

        return this.prisma.serviceOrder.update({
            where: { id },
            data: { status: 'CANCELLED' },
        });
    }

    search(filters: QueryServiceOrderDto) {
        const where: Prisma.ServiceOrderWhereInput = {};

        if (filters.motorcycleId) {
            where.motorcycleId = filters.motorcycleId;
        }
        if (filters.status) {
            where.status = filters.status;
        }

        return this.prisma.serviceOrder.findMany({ where });
    }

}