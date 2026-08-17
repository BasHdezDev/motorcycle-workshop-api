import { Injectable } from '@nestjs/common';

@Injectable()
export class DriverService {
  findAll() {
    return {
      message: 'Drivers service',
    };
  }
}