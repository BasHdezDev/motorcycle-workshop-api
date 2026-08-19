import { Body, Controller, Delete, Get, Patch, Post, Query } from '@nestjs/common';
import { DriverService } from './driver.service.js';
import { CreateDriverDto } from './dto/create-driver.dto/create-driver.dto';
import { Param } from '@nestjs/common';
import { UpdateDriverDto } from './dto/update-driver.dto/update-driver.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto/pagination-query.dto';

@Controller('drivers')
export class DriverController {
    constructor(private readonly driverService: DriverService) { }

    @Post()
    create(@Body() dto: CreateDriverDto) {
        return this.driverService.create(dto);
    }

    @Get()
    findAll(@Query() pagination: PaginationQueryDto) {
        return this.driverService.findAll(pagination);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.driverService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateDriverDto) {
        return this.driverService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.driverService.remove(id);
    }
}