import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class QueryDriverDto {
    @ApiPropertyOptional({ example: 'Fabinho' })
    @IsOptional()
    @IsString()
    firstName?: string;

    @ApiPropertyOptional({ example: 'Gonzalez' })
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
    @IsString()
    email?: string;
}