import { Injectable } from '@nestjs/common'

import { BullMQService } from '../../lib/bullMQ/bullMQ.service'
import { PrismaService } from '../../lib/prisma.service'

@Injectable()
export class BatchService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly bullMQService: BullMQService
  ) {}
}
