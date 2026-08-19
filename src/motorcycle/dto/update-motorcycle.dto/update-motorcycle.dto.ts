import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateMotorcycleDto {
  @ApiPropertyOptional({ example: 'ABC123' })
  @IsOptional()
  @IsString()
  licensePlate?: string;

  @ApiPropertyOptional({ example: 'Yamaha' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ example: 'MT-07' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ example: 2024 })
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  year?: number;

  @ApiPropertyOptional({ example: 689 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  engineDisplacement?: number;

  @ApiPropertyOptional({ example: 'Negro' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: 'CH123456' })
  @IsOptional()
  @IsString()
  chassisNumber?: string;

  @ApiPropertyOptional({ example: 'EN123456' })
  @IsOptional()
  @IsString()
  engineNumber?: string;

  // driverId intentionally omitted: a motorcycle's driver
  // cannot be changed after registration (business rule).
}