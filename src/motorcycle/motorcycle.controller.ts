import { Body, Controller, Post, Get, Param, Patch, Delete, Query } from '@nestjs/common';
import { MotorcycleService } from './motorcycle.service.js';
import { CreateMotorcycleDto } from './dto/create-motorcycle.dto/create-motorcycle.dto.js';
import { UpdateMotorcycleDto } from './dto/update-motorcycle.dto/update-motorcycle.dto.js';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto/pagination-query.dto.js';

@Controller('motorcycles')
export class MotorcycleController {
    constructor(private readonly motorcycleService: MotorcycleService) { }

    @Post()
    create(@Body() dto: CreateMotorcycleDto) {
        return this.motorcycleService.create(dto);
    }

    @Get()
    findAll(@Query() pagination: PaginationQueryDto) {
        return this.motorcycleService.findAll(pagination);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.motorcycleService.findOne(id);
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