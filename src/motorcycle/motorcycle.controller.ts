import { Controller } from '@nestjs/common';
import { MotorcycleService } from './motorcycle.service.js';

@Controller('motorcycles')
export class MotorcycleController {
  constructor(private readonly motorcycleService: MotorcycleService) {}
}