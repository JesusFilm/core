import { logger } from '../logger'

import { fixWhitespaceVideoTitles } from './fix-whitespace-video-titles'

async function main(): Promise<void> {
  const result = await fixWhitespaceVideoTitles()
  logger.info({ result }, 'Whitespace video title fix result')
}

main().catch((error) => {
  logger.error({ error }, 'run-fix-whitespace-video-titles failed')
  process.exit(1)
})
