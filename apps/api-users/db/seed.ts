// version 2
// increment to trigger re-seed (ie: files other than seed.ts are changed)

import { ArangoDB } from './db'

const db = ArangoDB()

async function main(): Promise<void> {
  if (!(await db.collection('users').exists())) {
    await db.createCollection('users', { keyOptions: { type: 'uuid' } })
  }
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
