
import { Client } from 'pg'
import NodeEnvironment from 'jest-environment-node'
import { nanoid } from 'nanoid'
import { promisify } from 'util'
import { exec } from 'child_process'
const promisedExec = promisify(exec)

const prismaBinary = './node_modules/.bin/prisma2'

class PrismaEnvironment extends NodeEnvironment {
  schema: string
  connectionString: string

  constructor (config) {
    super(config)

    // Generate a unique schema identifier for this test context
    this.schema = `test_${nanoid()}`

    // Generate the pg connection string for the test schema
    this.connectionString = `postgresql://test-user:test-password@localhost:5432/jf-core-journeys?schema=${this.schema}`
  }

  async setup (): Promise<void> {
    // Set the required environment variable to contain the connection string
    // to our database test schema
    process.env.DATABASE_URL = this.connectionString
    this.global.process.env.DATABASE_URL = this.connectionString
    process.env.SCHEMA = this.schema
    this.global.process.env.SCHEMA = this.schema

    // Run the migrations to ensure our schema has the required structure
    await promisedExec(`${prismaBinary} migrate dev --schema apps/api-journeys/prisma/schema.prisma`)
    await super.setup()
  }

  async teardown (): Promise<void> {
    // Drop the schema after the tests have completed
    const client = new Client({
      connectionString: this.connectionString
    })
    await client.connect()
    await client.query(`DROP SCHEMA IF EXISTS "${this.schema}" CASCADE`)
    await client.end()
    await super.teardown()
  }
}

module.exports = PrismaEnvironment
