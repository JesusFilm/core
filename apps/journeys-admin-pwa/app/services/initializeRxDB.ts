import { RxCollection, RxDatabase, addRxPlugin, createRxDatabase } from 'rxdb'
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode'
import { RxDBLeaderElectionPlugin } from 'rxdb/plugins/leader-election'
import { replicateGraphQL } from 'rxdb/plugins/replication-graphql'
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie'

import { itemSchema } from './todoSchema'

addRxPlugin(RxDBLeaderElectionPlugin)
addRxPlugin(RxDBDevModePlugin)

const GRAPHQL_ENDPOINT = 'http://127.0.0.1:4000/'

interface DataLayer {
  database: RxDatabase
  items: RxCollection
}

export async function initializeDataLayer(): Promise<DataLayer> {
  console.log('Initializing data layer...')
  const database = await createRxDatabase({
    name: 'journeys-admin-pwa',
    storage: getRxStorageDexie()
  })

  console.log('database created')

  const collections = await database.addCollections({
    items: {
      schema: itemSchema
    }
  })

  console.log('collections created:', collections)

  const replicationState = replicateGraphQL({
    collection: collections.items,
    url: {
      http: GRAPHQL_ENDPOINT
    },
    replicationIdentifier: 'journeys-replication',
    pull: {
      queryBuilder: () => ({
        query: `
          query Journeys {
            journeys {
              id
              title
            }
          }
        `,
        variables: {
          lastUpdateAt: 0
        }
      })
    },
    waitForLeadership: true
  })

  await replicationState.start()

  console.log('Replication started')

  console.log('RxDB initialized successfully')

  return { database, items: collections.items }
}
