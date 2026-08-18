import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ServiceOrderStatus } from '../../../../generated/prisma/client.js';

export class QueryServiceOrderDto {
  @IsOptional()
  @IsUUID()
  motorcycleId?: string;

  @IsOptional()
  @IsEnum(ServiceOrderStatus)
  status?: ServiceOrderStatus;
}