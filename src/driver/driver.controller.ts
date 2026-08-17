import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { DriverService } from './driver.service.js';
import { CreateDriverDto } from './dto/create-driver.dto/create-driver.dto';
import { Param } from '@nestjs/common';
import { UpdateDriverDto } from './dto/update-driver.dto/update-driver.dto.js';

@Controller('drivers')
export class DriverController {
    constructor(private readonly driverService: DriverService) { }

    @Post()
    create(@Body() dto: CreateDriverDto) {
        return this.driverService.create(dto);
    }

    @Get()
    findAll() {
        return this.driverService.findAll();
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