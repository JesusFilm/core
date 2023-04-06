import { Global, Module } from '@nestjs/common'
import { Database } from 'arangojs'
import type { Config } from 'arangojs/connection'

const databaseProviders = [
  {
    provide: 'DATABASE',
    useFactory: () => {
      let db: Database
      const config: Config = {
        url: process.env.DATABASE_URL,
        databaseName: process.env.DATABASE_DB,
        agentOptions: { maxSockets: 50 }
      }

      if (process.env.DATABASE_DB != null)
        db = new Database({
          ...config,
          databaseName: process.env.DATABASE_DB
        })
      else db = new Database(config)
      db.useBasicAuth(process.env.DATABASE_USER, process.env.DATABASE_PASS)
      return db
    }
  }
]

@Global()
@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders]
})
export class DatabaseModule {}
