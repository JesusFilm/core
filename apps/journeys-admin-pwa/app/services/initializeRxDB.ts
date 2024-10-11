import { RxDatabase, addRxPlugin, createRxDatabase } from 'rxdb'
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode'
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder'
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie'
import { RxDBUpdatePlugin } from 'rxdb/plugins/update'

import { TodoSchema } from './todoSchema'

addRxPlugin(RxDBUpdatePlugin)
addRxPlugin(RxDBQueryBuilderPlugin)

const DEXIE_STORAGE = getRxStorageDexie()
const DATABASE_NAME = 'database'
const COLLECTION_NAME = 'todo'

const isDevelopment = process.env.NODE_ENV !== 'production'

export async function initializeDatabase(): Promise<RxDatabase | null> {
  console.log('Starting database initialization')

  if (isDevelopment) {
    console.log('Adding DevMode plugin')
    addRxPlugin(RxDBDevModePlugin)
  }

  let database: RxDatabase

  try {
    console.log('Creating RxDatabase')
    database = await createRxDatabase({
      name: DATABASE_NAME,
      storage: DEXIE_STORAGE,
      multiInstance: true,
      ignoreDuplicate: true
    })
    console.log('RxDatabase created successfully')
  } catch (error) {
    console.error('Error creating database:', error)
    return null
  }

  try {
    console.log('Adding collection:', COLLECTION_NAME)
    await database.addCollections({
      [COLLECTION_NAME]: {
        schema: TodoSchema
      }
    })
    console.log('Collection added successfully')
  } catch (error) {
    await database.destroy()
    return null
  }

  try {
    console.log('Creating sample todo')
    const item = await database.todo.insert({
      id: '1',
      title: 'Sample Todo',
      description: 'This is a sample todo.',
      done: false
    })
    console.log('Sample todo inserted successfully: ', item)
  } catch (error) {
    console.error('Error inserting sample todo:', error)
  }

  console.log('Database initialization complete')
  return database
}
