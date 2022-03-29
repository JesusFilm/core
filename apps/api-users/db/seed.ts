import { ArangoDB } from './db'

const db = ArangoDB()

async function main(): Promise<void> {
  try {
    await db.createCollection('users', { keyOptions: { type: 'uuid' } })
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
