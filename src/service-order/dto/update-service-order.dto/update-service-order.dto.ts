import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsBoolean,
    IsDateString,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
} from 'class-validator';

export class UpdateServiceOrderDto {
    @ApiPropertyOptional({ example: 'Bujía dañada' })
    @IsOptional()
    @IsString()
    diagnosis?: string;

    @ApiPropertyOptional({ example: 'Cambio de bujía y aceite' })
    @IsOptional()
    @IsString()
    workPerformed?: string;

    @ApiPropertyOptional({ example: 80000 })
    @IsOptional()
    @IsNumber()
    @IsPositive()
    repairCost?: number;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    paymentCompleted?: boolean;

    @ApiPropertyOptional({ example: '2026-08-17T15:00:00.000Z' })
    @IsOptional()
    @IsDateString()
    paymentDate?: string;

    // status and checkOutDate are intentionally omitted: status
    // changes go through the dedicated status-transition endpoint,
    // which also sets checkOutDate when appropriate (e.g. on DELIVERED).
}