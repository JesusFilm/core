import { Database } from 'arangojs'

// import {Shared} from '@nestjs/core';
export const databaseProviders = [
  {
    provide: 'DATABASE',
    useFactory: () => {
      const db = new Database({ url: 'arangodb://arangodb:8529' })
      return db
    }
  }
]
