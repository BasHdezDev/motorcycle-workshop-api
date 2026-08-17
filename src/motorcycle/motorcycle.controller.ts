import { Body, Controller, Post, Get, Param } from '@nestjs/common';
import { MotorcycleService } from './motorcycle.service.js';
import { CreateMotorcycleDto } from './dto/create-motorcycle.dto/create-motorcycle.dto.js';

@Controller('motorcycles')
export class MotorcycleController {
    constructor(private readonly motorcycleService: MotorcycleService) { }

    @Post()
    create(@Body() dto: CreateMotorcycleDto) {
        return this.motorcycleService.create(dto);
    }

    @Get()
    findAll() {
        return this.motorcycleService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.motorcycleService.findOne(id);
    }
}