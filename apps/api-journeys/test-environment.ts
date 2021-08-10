
import { Client } from 'pg'
import { v4 as uuidv4 } from 'uuid'
import { exec } from 'child_process'
import { promisify } from 'util'
import NodeEnvironment = require('jest-environment-node')

const prismaBinary = './node_modules/.bin/prisma'

class PrismaTestEnvironment extends NodeEnvironment {
  private readonly schema: string
  private readonly connectionString: string

  constructor (config) {
    super(config)

    // Generate a unique schema identifier for this test context
    const id = uuidv4()
    this.schema = `test_${id as string}`

    // Generate the pg connection string for the test schema
    this.connectionString = `postgresql://test-user:test-password@localhost:9632/jf-core-journeys-test?schema=${this.schema}`
  }

  async setup (): Promise<void> {
    // Set the required environment variable to contain the connection string
    // to our database test schema
    process.env.DATABASE_URL = this.connectionString
    this.global.process.env.DATABASE_URL = this.connectionString

    // Run the migrations to ensure our schema has the required structure
    await promisify(exec)(`${prismaBinary} migrate dev --schema apps/api-journeys/prisma/schema.prisma`)

    return await super.setup()
  }

  async teardown (): Promise<void> {
    // Drop the schema after the tests have completed
    const client = new Client({
      connectionString: this.connectionString
    })
    await client.connect()
    await client.query(`DROP SCHEMA IF EXISTS "${this.schema}" CASCADE`)
    await client.end()
  }
}

module.exports = PrismaTestEnvironment
