import { Logger } from 'pino'

import { sendDataLangVideoSummary } from '../../../lib/videoSlack'

export async function service(logger?: Logger): Promise<void> {
  await sendDataLangVideoSummary(new Date(), logger)
}
