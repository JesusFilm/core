import { spawn } from 'child_process'
import fs, { createReadStream, promises as fsPromises } from 'fs'
import { join } from 'path'
import { pipeline } from 'stream/promises'
import { createGunzip } from 'zlib'

import { Logger } from 'pino'

import { prisma } from '../../../lib/prisma'
import { logger as baseLogger } from '../../../logger'

const GZIPPED_BACKUP_FILE_NAME = 'languages-backup.sql.gz'
const BACKUP_FILE_NAME = 'languages-backup.sql'

/**
 * Decompresses a gzipped file
 */
async function decompressFile(
  inputFile: string,
  outputFile: string,
  logger: Logger
): Promise<void> {
  logger.info('Decompressing gzipped file')

  try {
    const source = fs.createReadStream(inputFile)
    const gunzip = createGunzip()
    const destination = fs.createWriteStream(outputFile)

    await pipeline(source, gunzip, destination)

    logger.info('File decompression completed')
  } catch (error) {
    logger.error({ error }, 'Error decompressing file')
    throw error
  }
}

/**
 * Executes psql command to restore a database from SQL file
 */
async function executePsql(filePath: string, logger: Logger): Promise<void> {
  return new Promise((resolve, reject) => {
    const databaseUrl = new URL(process.env.PG_DATABASE_URL_LANGUAGES ?? '')
    const host = databaseUrl.hostname
    const port = databaseUrl.port
    const database = databaseUrl.pathname.slice(1)
    const username = databaseUrl.username

    const env = {
      ...process.env,
      PGPASSWORD: decodeURIComponent(databaseUrl.password)
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
      '-v',
      'ON_ERROR_STOP=1',
      '--single-transaction',
      '-f',
      filePath
    ]

    logger.info('Starting database restore with psql')

    const psql = spawn('psql', args, { env })

    psql.stderr.on('data', (data) => {
      logger.info(`psql: ${data}`)
    })

    psql.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        const error = new Error(`psql process exited with code ${code}`)
        logger.error({ error }, 'Failed to restore database')
        reject(error)
      }
    })

    psql.on('error', (error) => {
      logger.error({ error }, 'Error spawning psql process')
      reject(error)
    })
  })
}

/**
 * Imports data from a gzipped SQL file into the database
 */
export const service = async (customLogger?: Logger): Promise<void> => {
  const logger = customLogger ?? baseLogger.child({ worker: 'dataImport' })

  try {
    if (!process.env.DB_SEED_PATH) {
      throw new Error('DB_SEED_PATH environment variable is not set')
    }

    const seedPath = process.env.DB_SEED_PATH
    logger.info(`Using SQL backup from path: ${seedPath}`)

    const tempDir = join(process.cwd(), 'imports')
    await fsPromises.mkdir(tempDir, { recursive: true })

    // Copy and decompress the SQL file
    const sqlFile = join(tempDir, BACKUP_FILE_NAME)
    await decompressFile(seedPath, sqlFile, logger)

    // Import the SQL file using psql
    await executePsql(sqlFile, logger)

    // Update import times
    await prisma.importTimes.upsert({
      where: { modelName: 'dataImport' },
      update: { lastImport: new Date() },
      create: { modelName: 'dataImport', lastImport: new Date() }
    })

    // Clean up temporary file
    await fsPromises.unlink(sqlFile)

    logger.info('Database restore completed successfully')
  } catch (error) {
    logger.error({ error }, 'Error during database restore')
    throw error
  }
}
