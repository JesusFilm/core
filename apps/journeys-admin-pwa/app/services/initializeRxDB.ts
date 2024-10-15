import { RxDatabase, addRxPlugin, createRxDatabase } from 'rxdb'
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode'
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie'

import { journeySchema, journey } from './journeySchema'

addRxPlugin(RxDBDevModePlugin)

interface DataLayer {
  database: RxDatabase
}

export async function initializeRxDB(): Promise<DataLayer> {
  console.log('Initializing data layer...')
  const database = await createRxDatabase({
    name: 'journeys-admin-pwa',
    storage: getRxStorageDexie()
  })

  console.log('Database created')

  const collections = await database.addCollections({
    journeys: {
      schema: journeySchema
    }
  })

  const journeyExist = await collections.journeys
    .find({
      selector: { id: journey.id }
    })
    .exec()

  console.log('Journey exists', journeyExist)

  if (journeyExist.length === 0) {
    await collections.journeys.insert(journey)
    console.log('Journey inserted')
  }

  console.log('RxDB initialized successfully')

  return { database }
}
