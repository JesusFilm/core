import { ArangoDB } from './db'
import { user1 } from './seeds/user1'

const db = ArangoDB()

async function main(): Promise<void> {
  try {
    await db.createCollection('users', { keyOptions: { type: 'uuid' }})
    await db.createCollection('userJourneys', { keyOptions: { type: 'uuid' }})
  } catch {}
  await db.collection('users').ensureIndex({ type: 'persistent', fields: ['email'], name: 'email', unique: true })
  await user1()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
