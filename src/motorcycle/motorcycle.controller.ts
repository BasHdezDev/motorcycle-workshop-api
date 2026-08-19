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
import { MotorcycleService } from './motorcycle.service.js';
import { CreateMotorcycleDto } from './dto/create-motorcycle.dto/create-motorcycle.dto';
import { UpdateMotorcycleDto } from './dto/update-motorcycle.dto/update-motorcycle.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto/pagination-query.dto';

@ApiTags('motorcycles')
@Controller('motorcycles')
export class MotorcycleController {
  constructor(private readonly motorcycleService: MotorcycleService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new motorcycle' })
  create(@Body() dto: CreateMotorcycleDto) {
    return this.motorcycleService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all motorcycles (paginated)' })
  findAll(@Query() pagination: PaginationQueryDto) {
    return this.motorcycleService.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a motorcycle by id' })
  findOne(@Param('id') id: string) {
    return this.motorcycleService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: "Update a motorcycle (driver cannot be changed)" })
  update(@Param('id') id: string, @Body() dto: UpdateMotorcycleDto) {
    return this.motorcycleService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a motorcycle (fails if it has service orders)' })
  remove(@Param('id') id: string) {
    return this.motorcycleService.remove(id);
  }
}