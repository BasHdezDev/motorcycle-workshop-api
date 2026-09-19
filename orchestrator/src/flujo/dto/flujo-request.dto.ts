import { IsOptional, IsString, IsUUID } from 'class-validator';

export class FlujoRequestDto {
    @IsString()
    action!: string;

    @IsOptional()
    @IsUUID()
    orderId?: string;
}