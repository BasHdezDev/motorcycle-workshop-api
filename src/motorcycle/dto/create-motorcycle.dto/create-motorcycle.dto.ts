import { ApiProperty } from '@nestjs/swagger';
import {
    IsInt,
    IsNotEmpty,
    IsPositive,
    IsString,
    IsUUID,
    Max,
    Min,
} from 'class-validator';

export class CreateMotorcycleDto {
    @ApiProperty({ example: 'ABC123' })
    @IsString()
    @IsNotEmpty()
    licensePlate!: string;

    @ApiProperty({ example: 'Yamaha' })
    @IsString()
    @IsNotEmpty()
    brand!: string;

    @ApiProperty({ example: 'MT-07' })
    @IsString()
    @IsNotEmpty()
    model!: string;

    @ApiProperty({ example: 2024 })
    @IsInt()
    @Min(1900)
    @Max(new Date().getFullYear() + 1)
    year!: number;

    @ApiProperty({ example: 689 })
    @IsInt()
    @IsPositive()
    engineDisplacement!: number;

    @ApiProperty({ example: 'Negro' })
    @IsString()
    @IsNotEmpty()
    color!: string;

    @ApiProperty({ example: 'CH123456' })
    @IsString()
    @IsNotEmpty()
    chassisNumber!: string;

    @ApiProperty({ example: 'EN123456' })
    @IsString()
    @IsNotEmpty()
    engineNumber!: string;

    @ApiProperty({ example: 'e4a1c8b0-...' })
    @IsUUID()
    driverId!: string;
}