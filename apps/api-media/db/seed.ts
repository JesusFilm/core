// version 2
// increment to trigger re-seed (ie: files other than seed.ts are changed)

import { ArangoDB } from './db'
import { psMigrate } from './seeds/psMigrate'

const db = ArangoDB()

async function main(): Promise<void> {
  if (!(await db.collection('cloudflareImages').exists())) {
    await db.createCollection('cloudflareImages', {
      keyOptions: { type: 'uuid' }
    })
  }
  if (!(await db.collection('cloudflareVideos').exists())) {
    await db.createCollection('cloudflareVideos', {
      keyOptions: { type: 'uuid' }
    })
  }
  await psMigrate()
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
