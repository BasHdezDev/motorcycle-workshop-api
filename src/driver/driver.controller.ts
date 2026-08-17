import { Body, Controller, Get, Post } from '@nestjs/common';
import { DriverService } from './driver.service.js';
import { CreateDriverDto } from './dto/create-driver.dto/create-driver.dto';

@Controller('drivers')
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Post()
  create(@Body() dto: CreateDriverDto) {
    return this.driverService.create(dto);
  }

  @Get()
  findAll() {
    return this.driverService.findAll();
  }
}