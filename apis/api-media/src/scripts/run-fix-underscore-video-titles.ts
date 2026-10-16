import { logger } from '../logger'

import { fixUnderscoreVideoTitles } from './fix-underscore-video-titles'

async function main(): Promise<void> {
  const result = await fixUnderscoreVideoTitles()
  logger.info({ result }, 'Underscore video title fix result')
}

main().catch((error) => {
  logger.error({ error }, 'run-fix-underscore-video-titles failed')
  process.exit(1)
})
