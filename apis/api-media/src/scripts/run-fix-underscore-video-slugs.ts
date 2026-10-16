import { logger } from '../logger'

import { fixUnderscoreVideoSlugs } from './fix-underscore-video-slugs'

async function main(): Promise<void> {
  const result = await fixUnderscoreVideoSlugs()
  logger.info({ result }, 'Underscore video slug fix result')
}

main().catch((error) => {
  logger.error({ error }, 'run-fix-underscore-video-slugs failed')
  process.exit(1)
})
