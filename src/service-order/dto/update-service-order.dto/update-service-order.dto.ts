import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class UpdateServiceOrderDto {
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @IsOptional()
  @IsString()
  workPerformed?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  repairCost?: number;

  @IsOptional()
  @IsBoolean()
  paymentCompleted?: boolean;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  // status and checkOutDate are intentionally omitted: status
  // changes go through the dedicated status-transition endpoint,
  // which also sets checkOutDate when appropriate (e.g. on DELIVERED).
}