import { IsEnum } from 'class-validator';
import { ServiceOrderStatus } from '../../../../generated/prisma/client.js';

export class ChangeStatusDto {
  @IsEnum(ServiceOrderStatus)
  status!: ServiceOrderStatus;
}