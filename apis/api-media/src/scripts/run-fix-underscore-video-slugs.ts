import { logger } from '../logger'

import { fixUnderscoreVideoSlugs } from './fix-underscore-video-slugs'

async function main(): Promise<void> {
  const result = await fixUnderscoreVideoSlugs()
  logger.info({ result }, 'Underscore video slug fix result')
}

void main()
