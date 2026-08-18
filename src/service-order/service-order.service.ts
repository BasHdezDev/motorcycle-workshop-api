import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceOrderDto } from './dto/create-service-order.dto/create-service-order.dto';
import { Prisma, ServiceOrderStatus } from '../../generated/prisma/client.js';
import { UpdateServiceOrderDto } from './dto/update-service-order.dto/update-service-order.dto';

// Statuses that count as "active" for the one-active-order-per-motorcycle rule .
// This is per Bussiness Rule 1: "A motorcycle can have only one active service order at a time."
const ACTIVE_STATUSES: ServiceOrderStatus[] = [
    'RECEIVED',
    'UNDER_DIAGNOSIS',
    'UNDER_REPAIR',
    'READY',
];

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
        await this.findOne(id);
        return this.prisma.serviceOrder.update({ where: { id }, data: dto });
    }
}