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
  db: RxDatabase
  items: RxCollection
}

export async function initializeDataLayer(): Promise<DataLayer> {
  const db = await createRxDatabase({
    name: 'journeys-admin-pwa',
    storage: getRxStorageDexie()
  })

  const collections = await db.addCollections({
    items: {
      schema: itemSchema
    }
  })

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
    live: true,
    retryTime: 1000 * 300, // 5 minutes
    waitForLeadership: true
  })

  await replicationState.start()

  return { db, items: collections.items }
}
