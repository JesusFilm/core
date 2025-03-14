import { spawn } from 'child_process'
import { promises as fs } from 'fs'
import { join } from 'path'

import { Logger } from 'pino'

import { logger as baseLogger } from '../../../logger'

/**
 * Executes pg_dump command to create a database backup
 */
async function executePgDump(
  outputFile: string,
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
      '-F',
      'c',
      '-Z',
      '9',
      '--no-owner',
      '--no-privileges',
      '-f',
      outputFile
    ]

    logger.info('Starting database export')

    const dump = spawn('pg_dump', args, { env })

    dump.stderr.on('data', (data) => {
      logger.info(`pg_dump: ${data}`)
    })

    dump.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        const error = new Error(`pg_dump process exited with code ${code}`)
        logger.error({ error }, 'Failed to export database')
        reject(error)
      }
    })

    dump.on('error', (error) => {
      logger.error({ error }, 'Error spawning pg_dump process')
      reject(error)
    })
  })
}

/**
 * Exports database to a pgdump file
 */
export const service = async (customLogger?: Logger): Promise<void> => {
  const logger = customLogger ?? baseLogger.child({ worker: 'dataExport' })

  try {
    const outputDir = join(process.cwd(), 'exports')
    await fs.mkdir(outputDir, { recursive: true })

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const outputFile = join(outputDir, `languages-export-${timestamp}.pgdump`)

    await executePgDump(outputFile, logger)

    logger.info('Database export completed successfully')
  } catch (error) {
    logger.error({ error }, 'Error during database export')
    throw error
  }
}
