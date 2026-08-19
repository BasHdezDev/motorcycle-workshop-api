import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ServiceOrderStatus } from '../../../../generated/prisma/client.js';

export class QueryServiceOrderDto {
    @ApiPropertyOptional({ example: 'e4a1c8b0-...' })
    @IsOptional()
    @IsUUID()
    motorcycleId?: string;

    @ApiPropertyOptional({ enum: ServiceOrderStatus, example: 'UNDER_REPAIR' })
    @IsOptional()
    @IsEnum(ServiceOrderStatus)
    status?: ServiceOrderStatus;
}