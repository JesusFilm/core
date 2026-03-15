import 'dotenv/config'

import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'db/schema.prisma',
  datasource: {
    url: env('PG_DATABASE_URL_ANALYTICS')
  }
})
