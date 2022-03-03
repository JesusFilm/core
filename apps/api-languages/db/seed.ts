import { ArangoDB } from './db'

const db = ArangoDB()

async function main(): Promise<void> {
  try {
    await db.createCollection('languages', { keyOptions: { type: 'uuid' } })
  } catch {}
  await db.collection('languages').ensureIndex({
    type: 'persistent',
    fields: ['bcp47'],
    name: 'bcp47',
    unique: true
  })
  await db.collection('languages').ensureIndex({
    type: 'persistent',
    fields: ['iso3'],
    name: 'iso3',
    unique: true
  })
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
