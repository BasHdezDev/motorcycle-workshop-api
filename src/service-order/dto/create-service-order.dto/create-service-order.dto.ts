import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsDateString,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
} from 'class-validator';

export class CreateServiceOrderDto {
    @ApiProperty({ example: 'SO-0001' })
    @IsString()
    @IsNotEmpty()
    orderNumber!: string;

    @ApiProperty({ example: 'e4a1c8b0-...' })
    @IsUUID()
    motorcycleId!: string;

    @ApiProperty({ example: '2026-08-17T10:00:00.000Z' })
    @IsDateString()
    checkInDate!: string;

    @ApiProperty({ example: 'No enciende' })
    @IsString()
    @IsNotEmpty()
    problemDescription!: string;

    @ApiPropertyOptional({ example: 'El pistón no pistonea' })
    @IsOptional()
    @IsString()
    diagnosis?: string;

    // status is intentionally omitted: every new order starts as
    // RECEIVED (schema default) and only changes via the dedicated
    // status-transition endpoint.
    //
    // checkOutDate, workPerformed, repairCost, paymentCompleted and
    // paymentDate are intentionally omitted here too: they only make
    // sense as the order progresses through the workshop, not at
    // creation time.
}