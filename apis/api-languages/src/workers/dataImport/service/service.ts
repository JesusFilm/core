import { spawn } from 'child_process'
import fs, { promises as fsPromises } from 'fs'
import { join } from 'path'
import { Readable } from 'stream'
import { pipeline } from 'stream/promises'

import { Logger } from 'pino'

import { prisma } from '../../../lib/prisma'
import { logger as baseLogger } from '../../../logger'

/**
 * Downloads a file from a URL and saves it locally
 */
async function downloadFile(
  url: string,
  outputPath: string,
  logger: Logger
): Promise<void> {
  logger.info('Downloading database file')

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`)
  }

  const fileStream = fs.createWriteStream(outputPath)
  await pipeline(Readable.fromWeb(response.body as any), fileStream)

  logger.info('Download completed')
}

/**
 * Executes pg_restore command to restore a database backup
 */
async function executePgRestore(
  filePath: string,
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
export const service = async (customLogger?: Logger): Promise<void> => {
  const logger = customLogger ?? baseLogger.child({ worker: 'dataImport' })

  try {
    if (!process.env.DB_SEED_URL) {
      throw new Error('DB_SEED_URL environment variable is not set')
    }

    const tempDir = join(process.cwd(), 'imports')
    await fsPromises.mkdir(tempDir, { recursive: true })

    const fileToImport = join(tempDir, 'languages-backup.pgdump')
    await downloadFile(process.env.DB_SEED_URL, fileToImport, logger)

    await executePgRestore(fileToImport, logger)

    // Update import times
    await prisma.importTimes.upsert({
      where: { modelName: 'dataImport' },
      update: { lastImport: new Date() },
      create: { modelName: 'dataImport', lastImport: new Date() }
    })

    // Clean up downloaded file
    await fsPromises.unlink(fileToImport)

    logger.info('Database restore completed successfully')
  } catch (error) {
    logger.error({ error }, 'Error during database restore')
    throw error
  }
}
