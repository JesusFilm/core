import { ArangoDB } from './db'

const db = ArangoDB()

async function main(): Promise<void> {
  if (!(await db.collection('cloudflareImages').exists())) {
    await db.createCollection('cloudflareImages', {
      keyOptions: { type: 'uuid' }
    })
  }
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
