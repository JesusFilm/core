import { Logger } from 'pino'

import { importShortLinks } from '../importers'

export async function service(logger?: Logger): Promise<void> {
  await importShortLinks(logger)
}
