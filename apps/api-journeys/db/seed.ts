import { ArangoDB } from './db'
import { nua1 } from './seeds/nua1'
import { nua2 } from './seeds/nua2'
import { nua8 } from './seeds/nua8'
import { nua9 } from './seeds/nua9'

const db = ArangoDB()

async function main(): Promise<void> {
  if (!(await db.collection('journeys').exists()))
    await db.createCollection('journeys', {
      keyOptions: { type: 'uuid' }
    })

  if (!(await db.collection('blocks').exists()))
    await db.createCollection('blocks', { keyOptions: { type: 'uuid' } })

  if (!(await db.collection('events').exists()))
    await db.createCollection('events', {
      keyOptions: { type: 'uuid' }
    })

  if (!(await db.collection('userJourneys').exists()))
    await db.createCollection('userJourneys', {
      keyOptions: { type: 'uuid' }
    })

  if (!(await db.collection('userRoles').exists()))
    await db.createCollection('userRoles', {
      keyOptions: { type: 'uuid' }
    })

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
