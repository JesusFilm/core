import { logger } from '../logger'

import { fixUnderscoreVideoTitles } from './fix-underscore-video-titles'

async function main(): Promise<void> {
  const result = await fixUnderscoreVideoTitles()
  logger.info({ result }, 'Underscore video title fix result')
}

void main()
