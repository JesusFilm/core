import { Injectable, Logger } from '@nestjs/common'
import { Cron, Interval } from '@nestjs/schedule'

@Injectable()
export class EmailSubscriptionController {
  private readonly logger = new Logger(EmailSubscriptionController.name)

  // called at 5:30pm every Friday
  @Cron('0 30 17 * * 5')
  weeklySummary() {
    // blocked by api-user work
    this.logger.debug('called at 5:30pm every Friday')
  }
}
