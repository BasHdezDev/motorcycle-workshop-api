import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateServiceOrderDto {
  @IsString()
  @IsNotEmpty()
  orderNumber!: string;

  @IsUUID()
  motorcycleId!: string;

  @IsDateString()
  checkInDate!: string;

  @IsString()
  @IsNotEmpty()
  problemDescription!: string;

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
  // creation time!!
}