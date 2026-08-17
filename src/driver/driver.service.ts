import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto/create-driver.dto';
import { Prisma } from '../../generated/prisma/client.js';

@Injectable()
export class DriverService {
  constructor(private readonly prisma: PrismaService) { }

  async create(dto: CreateDriverDto) {
    try {
      return await this.prisma.driver.create({ data: dto });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const field = (error.meta?.target as string[])?.join(', ');
        throw new ConflictException(`${field} already in use`);
      }
      throw error;
    }
  }

  findAll() {
    return this.prisma.driver.findMany();
  }
}