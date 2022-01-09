import { Database } from 'arangojs'

const db = new Database({ url: process.env.DATABASE_URL })

async function main(): Promise<void> {
  try {
    await db.createCollection('users', { keyOptions: { type: 'uuid' } })
    await db.createCollection('userJourneys', { keyOptions: { type: 'uuid' } })
  } catch {}
  await db.collection('users').ensureIndex({
    type: 'persistent',
    fields: ['email'],
    name: 'email',
    unique: true
  })
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
