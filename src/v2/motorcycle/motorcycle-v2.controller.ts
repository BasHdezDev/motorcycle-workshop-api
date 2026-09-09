import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { MotorcycleService } from '../../motorcycle/motorcycle.service';
import { CreateMotorcycleDto } from '../../motorcycle/dto/create-motorcycle.dto/create-motorcycle.dto';
import { UpdateMotorcycleDto } from '../../motorcycle/dto/update-motorcycle.dto/update-motorcycle.dto';
import { QueryMotorcycleDto } from '../../motorcycle/dto/query-motorcycle.dto/query-motorcycle.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto/pagination-query.dto';
import { ApiKeyGuard } from '../common/api-key.guard';

@Controller('api/v2/motorcycles')
@UseGuards(ApiKeyGuard)
export class MotorcycleV2Controller {
    constructor(private readonly motorcycleService: MotorcycleService) { }

    @Get()
    findAll(@Query() pagination: PaginationQueryDto) {
        return this.motorcycleService.findAll(pagination);
    }

    @Get('query')
    query(@Query() filters: QueryMotorcycleDto) {
        return this.motorcycleService.search(filters);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.motorcycleService.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateMotorcycleDto) {
        return this.motorcycleService.create(dto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateMotorcycleDto) {
        return this.motorcycleService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.motorcycleService.remove(id);
    }
}