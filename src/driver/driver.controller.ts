import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DriverService } from './driver.service.js';
import { CreateDriverDto } from './dto/create-driver.dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto/update-driver.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto/pagination-query.dto';

@ApiTags('drivers')
@Controller('drivers')
export class DriverController {
    constructor(private readonly driverService: DriverService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new driver' })
    create(@Body() dto: CreateDriverDto) {
        return this.driverService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'List all drivers (paginated)' })
    findAll(@Query() pagination: PaginationQueryDto) {
        return this.driverService.findAll(pagination);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a driver by id' })
    findOne(@Param('id') id: string) {
        return this.driverService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a driver' })
    update(@Param('id') id: string, @Body() dto: UpdateDriverDto) {
        return this.driverService.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a driver (fails if it has registered motorcycles)' })
    remove(@Param('id') id: string) {
        return this.driverService.remove(id);
    }
}