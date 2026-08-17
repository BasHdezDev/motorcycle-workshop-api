import { IsInt, IsOptional, IsPositive, IsString, Max, Min } from 'class-validator';

export class UpdateMotorcycleDto {
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
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  year?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  engineDisplacement?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  chassisNumber?: string;

  @IsOptional()
  @IsString()
  engineNumber?: string;

  // driverId intentionally omitted: a motorcycle's driver
  // cannot be changed after registration (business rule).
}