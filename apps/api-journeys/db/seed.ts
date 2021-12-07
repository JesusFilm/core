import { Database } from 'arangojs'


import { nua1 } from './seeds/nua1'
import { nua2 } from './seeds/nua2'
import { nua8 } from './seeds/nua8'
import { nua9 } from './seeds/nua9'

const db = new Database({ url: process.env.DATABASE_URL })

async function main(): Promise<void> {
  try {
    await db.createCollection('journeys')
    await db.createCollection('blocks')
    await db.createCollection('responses')
  } catch {}
  await nua1()
  await nua2()
  await nua8()
  await nua9()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
