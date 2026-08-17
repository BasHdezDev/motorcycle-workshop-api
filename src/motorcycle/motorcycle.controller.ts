import { Body, Controller, Post, Get, Param, Patch, Delete } from '@nestjs/common';
import { MotorcycleService } from './motorcycle.service.js';
import { CreateMotorcycleDto } from './dto/create-motorcycle.dto/create-motorcycle.dto.js';
import { UpdateMotorcycleDto } from './dto/update-motorcycle.dto/update-motorcycle.dto.js';

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

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateMotorcycleDto) {
        return this.motorcycleService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.motorcycleService.remove(id);
    }
}