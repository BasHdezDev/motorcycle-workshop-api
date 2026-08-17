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
    @IsString()
    @IsNotEmpty()
    licensePlate!: string;

    @IsString()
    @IsNotEmpty()
    brand!: string;

    @IsString()
    @IsNotEmpty()
    model!: string;

    @IsInt()
    @Min(1900)
    @Max(new Date().getFullYear() + 1)
    year!: number;

    @IsInt()
    @IsPositive()
    engineDisplacement!: number;

    @IsString()
    @IsNotEmpty()
    color!: string;

    @IsString()
    @IsNotEmpty()
    chassisNumber!: string;

    @IsString()
    @IsNotEmpty()
    engineNumber!: string;

    @IsUUID()
    driverId!: string;
}