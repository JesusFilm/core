import { Database } from 'arangojs'


export const databaseProviders = [
  {
    provide: 'DATABASE',
    useFactory: () => {
      const db = new Database({ url: process.env.DATABASE_URL })
      return db
    }
  }
]
