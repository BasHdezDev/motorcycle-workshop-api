import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class QueryMotorcycleDto {
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
    year?: number;

    @ApiPropertyOptional({ example: 'e4a1c8b0-...' })
    @IsOptional()
    @IsUUID()
    driverId?: string;
}