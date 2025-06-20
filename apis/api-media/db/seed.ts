// version 0
// increment to trigger re-seed (ie: files other than seed.ts are changed)

import { shortLinkDomain } from './seeds/shortLinkDomain'

async function main(): Promise<void> {
  await shortLinkDomain()
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
