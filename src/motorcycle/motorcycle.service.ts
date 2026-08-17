import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MotorcycleService {
  constructor(private readonly prisma: PrismaService) {}
}