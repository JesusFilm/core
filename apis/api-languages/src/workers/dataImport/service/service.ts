import { spawn } from 'child_process'
import { promises as fs } from 'fs'

import { Logger } from 'pino'

import { prisma } from '../../../lib/prisma'
import { logger as baseLogger } from '../../../logger'

/**
 * Executes pg_restore command to restore a database backup
 */
async function executePgRestore(
  filePath: string,
  options: { cleanDatabase?: boolean },
  logger: Logger
): Promise<void> {
  return new Promise((resolve, reject) => {
    const databaseUrl = new URL(process.env.PG_DATABASE_URL_LANGUAGES ?? '')
    const host = databaseUrl.hostname
    const port = databaseUrl.port
    const database = databaseUrl.pathname.slice(1)
    const username = databaseUrl.username

    const env = {
      ...process.env,
      PGPASSWORD: databaseUrl.password
    }

    const args = [
      '-h',
      host,
      '-p',
      port,
      '-U',
      username,
      '-d',
      database,
      '--clean',
      '--if-exists',
      '--no-owner',
      '--no-privileges',
      '--single-transaction',
      filePath
    ]

    logger.info('Starting database restore')

    const restore = spawn('pg_restore', args, { env })

    restore.stderr.on('data', (data) => {
      logger.info(`pg_restore: ${data}`)
    })

    restore.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        const error = new Error(`pg_restore process exited with code ${code}`)
        logger.error({ error }, 'Failed to restore database')
        reject(error)
      }
    })

    restore.on('error', (error) => {
      logger.error({ error }, 'Error spawning pg_restore process')
      reject(error)
    })
  })
}

/**
 * Imports data from a pgdump file into the database
 */
export const service = async (
  filePath: string,
  options: {
    clearExistingData?: boolean
    importModels?: string[]
  } = {},
  customLogger?: Logger
): Promise<void> => {
  const logger = customLogger ?? baseLogger.child({ worker: 'dataImport' })

  try {
    if (!(await fs.stat(filePath).catch(() => false))) {
      throw new Error(`File not found: ${filePath}`)
    }

    await executePgRestore(
      filePath,
      { cleanDatabase: options.clearExistingData },
      logger
    )

    await prisma.importTimes.upsert({
      where: { modelName: 'dataImport' },
      update: { lastImport: new Date() },
      create: { modelName: 'dataImport', lastImport: new Date() }
    })

    logger.info('Database restore completed successfully')
  } catch (error) {
    logger.error({ error }, 'Error during database restore')
    throw error
  }
}
