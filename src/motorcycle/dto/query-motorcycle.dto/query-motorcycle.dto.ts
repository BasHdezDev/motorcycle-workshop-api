import { IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class QueryMotorcycleDto {
  @IsOptional()
  @IsString()
  licensePlate?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsInt()
  year?: number;

  @IsOptional()
  @IsUUID()
  driverId?: string;
}