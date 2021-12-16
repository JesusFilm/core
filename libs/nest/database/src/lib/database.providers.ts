import { Database } from "arangojs"

export const databaseProviders = [
  {
    provide: 'DATABASE',
    useFactory: () => {
      let db: Database
      if (process.env.DATABASE_DB != null)
        db = new Database({ url: process.env.DATABASE_URL, databaseName: process.env.DATABASE_DB})
      else 
        db = new Database({ url: process.env.DATABASE_URL })
      db.useBasicAuth(process.env.DATABASE_USER, process.env.DATABASE_PASS)
      return db
    }
  }
]
