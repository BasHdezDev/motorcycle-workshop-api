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
import { DriverService } from '../../driver/driver.service';
import { CreateDriverDto } from '../../driver/dto/create-driver.dto/create-driver.dto';
import { UpdateDriverDto } from '../../driver/dto/update-driver.dto/update-driver.dto';
import { QueryDriverDto } from '../../driver/dto/query-driver.dto/query-driver.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto/pagination-query.dto';
import { ApiKeyGuard } from '../common/api-key.guard';

@Controller('api/v2/drivers')
@UseGuards(ApiKeyGuard)
export class DriverV2Controller {
    constructor(private readonly driverService: DriverService) { }

    @Get()
    findAll(@Query() pagination: PaginationQueryDto) {
        return this.driverService.findAll(pagination);
    }

    @Get('query')
    query(@Query() filters: QueryDriverDto) {
        return this.driverService.search(filters);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.driverService.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateDriverDto) {
        return this.driverService.create(dto);
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