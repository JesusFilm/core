import { Injectable } from '@nestjs/common';


import { PrismaService } from '../../lib/prisma.service';
import { BullMQService } from '../bullMQ/bullMQ.service';

@Injectable()
export class BatchService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly bullMQService: BullMQService,
  ) {}
}
