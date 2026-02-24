const databaseConfig = ({ env }) => {
  return {
    connection: {
      client: 'postgres',
      connection: {
        connectionString: env('PG_DATABASE_URL_CMS')
      },
      pool: {
        min: env.int('DATABASE_POOL_MIN', 2),
        max: env.int('DATABASE_POOL_MAX', 10)
      },
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000)
    }
  }
}

export default databaseConfig
