import { Logger } from 'pino'

import { populateCrowdinIds } from '../populateCrowdinIds'

export async function service(logger?: Logger): Promise<void> {
  await populateCrowdinIds(logger)
}
