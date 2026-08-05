import { config } from 'dotenv'
import { defineConfig, env } from 'prisma/config'

// `quiet` suppresses the banner dotenv@17 prints by default. Must run before
// `defineConfig`, whose `env()` resolves eagerly and throws on a missing var.
config({ quiet: true })

export default defineConfig({
  schema: 'db/schema.prisma',
  migrations: {
    path: 'db/migrations'
  },
  datasource: {
    url: env('PG_DATABASE_URL_JOURNEYS')
  }
})
