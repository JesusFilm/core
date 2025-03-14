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
    // Get database connection details from environment variable
    const databaseUrl = new URL(process.env.PG_DATABASE_URL_LANGUAGES ?? '')
    const host = databaseUrl.hostname
    const port = databaseUrl.port
    const database = databaseUrl.pathname.slice(1) // Remove leading slash
    const username = databaseUrl.username

    // Set environment variables for pg_restore
    const env = {
      ...process.env,
      PGPASSWORD: databaseUrl.password
    }

    // Build pg_restore command arguments
    const args = [
      '-h',
      host,
      '-p',
      port,
      '-U',
      username,
      '-d',
      database,
      '-v', // verbose
      '--clean', // Always clean before restore
      '--if-exists', // Drop objects if they exist
      '--no-owner', // Prevent ownership issues
      '--no-privileges', // Prevent permission issues
      '--no-comments', // Skip comments for cleaner restore
      '--single-transaction' // Ensure atomicity
    ]

    // Remove the conditional clean option since we're always using --clean now
    if (options.cleanDatabase) {
      logger.info('Clean option is always enabled with --if-exists')
    }

    // Add file path
    args.push(filePath)

    logger.info(
      { command: 'pg_restore', args: args.join(' ') },
      'Executing pg_restore'
    )

    const restore = spawn('pg_restore', args, { env })

    restore.stdout.on('data', (data) => {
      logger.debug(`pg_restore stdout: ${data}`)
    })

    restore.stderr.on('data', (data) => {
      logger.debug(`pg_restore stderr: ${data}`)
    })

    restore.on('close', (code) => {
      if (code === 0) {
        logger.info('Database restore completed successfully')

        // Verify data after restore
        void (async () => {
          try {
            const counts = await Promise.all([
              prisma.language.count(),
              prisma.country.count(),
              prisma.continent.count()
            ])

            logger.info(
              {
                languageCount: counts[0],
                countryCount: counts[1],
                continentCount: counts[2]
              },
              'Data verification after restore'
            )

            if (counts.every((count) => count === 0)) {
              logger.warn('No data found in main tables after restore')
            }
          } catch (error) {
            logger.error({ error }, 'Error verifying data after restore')
          }
        })()
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
    logger.info({ filePath }, 'Starting database restore')

    if (!(await fs.stat(filePath).catch(() => false))) {
      throw new Error(`File not found: ${filePath}`)
    }

    // Execute pg_restore
    await executePgRestore(
      filePath,
      { cleanDatabase: options.clearExistingData },
      logger
    )

    // Update import times
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
