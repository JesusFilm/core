import { ArangoDB } from './db'

const db = ArangoDB()

async function main(): Promise<void> {
  if (!(await db.collection('cloudflareImages').exists())) {
    await db.createCollection('cloudflareImages', {
      keyOptions: { type: 'uuid' }
    })
  }
  await db.collection('cloudflareImages').ensureIndex({
    type: 'persistent',
    fields: ['userId', 'imageId'],
    name: 'userId_imageId',
    unique: true
  })
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
