import { Logger } from 'pino'

import { service as bigQueryService } from '../bigQuery/service/service'

export async function service(logger?: Logger): Promise<void> {
  await bigQueryService(logger)
}
