import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ServiceOrderStatus } from '../../../../generated/prisma/client.js';

export class ChangeStatusDto {
    @ApiProperty({ enum: ServiceOrderStatus, example: 'UNDER_DIAGNOSIS' })
    @IsEnum(ServiceOrderStatus)
    status!: ServiceOrderStatus;
}