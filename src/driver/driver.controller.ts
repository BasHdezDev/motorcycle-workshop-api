import { Controller, Get } from '@nestjs/common';

@Controller('drivers')
export class DriverController {
    @Get()
    findAll() {
        return {
            message: 'Drivers endpoint',
        };
    }
}