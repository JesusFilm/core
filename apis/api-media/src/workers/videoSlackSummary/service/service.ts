import { Logger } from 'pino'

import { sendWeeklyVideoSummary } from '../../../lib/videoSlack'

export async function service(logger?: Logger): Promise<void> {
  await sendWeeklyVideoSummary(new Date(), logger)
}
