import { Logger } from 'pino'

import { sendVideoLabelConsistencyAlert } from '../../lib/videoLabelConsistency'

export async function service(logger?: Logger): Promise<void> {
  await sendVideoLabelConsistencyAlert(logger)
}
