import { Body, Controller, Headers, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiKeyGuard } from '../common/api-key.guard';
import { FlujoService } from './flujo.service';
import { FlujoRequestDto } from './dto/flujo-request.dto';

@Controller('api/v2/flujo')
@UseGuards(ApiKeyGuard)
export class FlujoController {
    constructor(private readonly flujoService: FlujoService) { }

    @Post()
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    async ejecutar(
        @Body() dto: FlujoRequestDto,
        @Headers('x-trace-id') traceId: string | undefined,
    ) {
        return this.flujoService.ejecutar(dto, traceId);
    }
}