import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ServiceOrderPriority } from '../../../../generated/prisma/client.js';
import { CreateServiceOrderDto } from '../../../service-order/dto/create-service-order.dto/create-service-order.dto';
import { UpdateServiceOrderDto } from '../../../service-order/dto/update-service-order.dto/update-service-order.dto';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto/pagination-query.dto';

export class CreateServiceOrderV4Dto extends CreateServiceOrderDto {
    @ApiPropertyOptional({ enum: ServiceOrderPriority, default: 'NORMAL' })
    @IsOptional()
    @IsEnum(ServiceOrderPriority)
    priority?: ServiceOrderPriority;
}

export class UpdateServiceOrderV4Dto extends UpdateServiceOrderDto {
    @ApiPropertyOptional({ enum: ServiceOrderPriority })
    @IsOptional()
    @IsEnum(ServiceOrderPriority)
    priority?: ServiceOrderPriority;
}

export class QueryServiceOrderV4Dto extends PaginationQueryDto {
    @ApiPropertyOptional({ enum: ServiceOrderPriority })
    @IsOptional()
    @IsEnum(ServiceOrderPriority)
    priority?: ServiceOrderPriority;
}