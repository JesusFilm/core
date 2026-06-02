import { Logger } from 'pino'

import { sendProductionManagerFlagshipSummary } from '../../../lib/videoSlack'

export async function service(logger?: Logger): Promise<void> {
  await sendProductionManagerFlagshipSummary(new Date(), logger)
}
