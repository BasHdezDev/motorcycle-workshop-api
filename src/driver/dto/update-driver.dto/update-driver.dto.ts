import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateDriverDto {
    @ApiPropertyOptional({ example: 'Pirineo' })
    @IsOptional()
    @IsString()
    firstName?: string;

    @ApiPropertyOptional({ example: 'Gomez' })
    @IsOptional()
    @IsString()
    lastName?: string;

    @ApiPropertyOptional({ example: '123456789' })
    @IsOptional()
    @IsString()
    documentNumber?: string;

    @ApiPropertyOptional({ example: '3001234567' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({ example: 'juan@test.com' })
    @IsOptional()
    @IsEmail()
    email?: string;
}