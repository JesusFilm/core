import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'

import { JourneyVisitorService } from '../journeyVisitor/journeyVisitor.service'
import { PrismaService } from '../../lib/prisma.service'

@Injectable()
export class EmailSubscriptionController {
  constructor(private readonly prismaService: PrismaService) {}

  // called at 5:30pm every Friday
  @Cron('0 30 17 * * 5')
  async weeklySummary(): Promise<void> {
    const lastDay = Date.now() - 24 * 60 * 60 * 1000
    const lastDayIso = new Date(lastDay).toISOString()
    const res = await this.prismaService.journeyVisitor.findMany({
      where: {
        createdAt: {
          gte: lastDayIso
        }
      }
    })
    // blocked by api-user work to get journey owner email
  }
}
