import { Logger } from 'pino'

import { runCrowdinIdOperation } from '../populateCrowdinIds'

export async function service(logger?: Logger): Promise<void> {
  await runCrowdinIdOperation(logger)
}
