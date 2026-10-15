import { logger } from '../logger'

import { fixKnowGodSlug } from './fix-know-god-slug'

async function main(): Promise<void> {
  const result = await fixKnowGodSlug()
  logger.info({ result }, 'Know God slug fix result')
}

main().catch((error) => {
  logger.error({ error }, 'run-fix-know-god-slug failed')
  process.exit(1)
})
