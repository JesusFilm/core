import { ArangoDB } from './db'
import { nua1 } from './seeds/nua1'
import { nua2 } from './seeds/nua2'
import { nua8 } from './seeds/nua8'
import { nua9 } from './seeds/nua9'

const db = ArangoDB()

async function main(): Promise<void> {
  try {
    await db.createCollection('journeys', {
      keyOptions: { type: 'uuid' }
    })
    await db.createCollection('blocks', { keyOptions: { type: 'uuid' } })
    await db.createCollection('responses', {
      keyOptions: { type: 'uuid' }
    })
    await db.createCollection('userJourneys', { keyOptions: { type: 'uuid' } })
  } catch {}
  await db.collection('journeys').ensureIndex({
    type: 'persistent',
    fields: ['slug'],
    name: 'slug',
    unique: true
  })
  await db.collection('blocks').ensureIndex({
    type: 'persistent',
    fields: ['journeyId'],
    name: 'journeyId'
  })
  await nua1()
  await nua2()
  await nua8()
  await nua9()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
