// version 1
// increment to trigger re-seed (ie: files other than seed.ts are changed)

import { shortLinkDomain } from './seeds/shortLinkDomain'
import { seedWatchVideos } from './seeds/watchVideos'

async function main(): Promise<void> {
  await shortLinkDomain()
  await seedWatchVideos()
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
