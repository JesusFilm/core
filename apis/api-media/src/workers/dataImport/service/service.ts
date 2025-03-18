import { spawn } from 'child_process'
import fs, { promises as fsPromises } from 'fs'
import { join } from 'path'
import { Readable } from 'stream'
import { pipeline } from 'stream/promises'
import { createGunzip } from 'zlib'

import { Logger } from 'pino'

import { prisma } from '../../../lib/prisma'
import { logger as baseLogger } from '../../../logger'

const BACKUP_FILE_NAME = 'media-backup.pgdump'
const CLOUDFLARE_IMAGES_FILE_NAME = 'cloudflareImage-system-data.sql.gz'

/**
 * Downloads a file from a URL and saves it locally
 */
async function downloadFile(
  url: string,
  outputPath: string,
  logger: Logger
): Promise<void> {
  logger.info(`Downloading file from ${url} to ${outputPath}`)

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
    const databaseUrl = new URL(process.env.PG_DATABASE_URL_MEDIA ?? '')
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
 * Imports CloudflareImage data from a CSV file using psql
 */
async function importCloudflareImageData(
  filePath: string,
  logger: Logger
): Promise<void> {
  return new Promise((resolve, reject) => {
    const databaseUrl = new URL(process.env.PG_DATABASE_URL_MEDIA ?? '')
    const host = databaseUrl.hostname
    const port = databaseUrl.port
    const database = databaseUrl.pathname.slice(1)
    const username = databaseUrl.username

    const env = {
      ...process.env,
      PGPASSWORD: decodeURIComponent(databaseUrl.password)
    }

    // Decompress the gzipped file first
    logger.info('Decompressing CloudflareImage data')

    // Create a temporary uncompressed file
    const tempFilePath = `${filePath}.tmp`

    // Set up decompression pipeline
    const readStream = fs.createReadStream(filePath)
    const writeStream = fs.createWriteStream(tempFilePath)
    const gunzip = createGunzip()

    pipeline(readStream, gunzip, writeStream)
      .then(() => {
        logger.info('CloudflareImage data decompressed, starting import')

        // First truncate the table
        const truncateCommand = `TRUNCATE TABLE "CloudflareImage";`

        const truncateProcess = spawn(
          'psql',
          [
            '-h',
            host,
            '-p',
            port,
            '-U',
            username,
            '-d',
            database,
            '-c',
            truncateCommand
          ],
          { env }
        )

        truncateProcess.stderr.on('data', (data) => {
          logger.info(`psql truncate stderr: ${data}`)
        })

        truncateProcess.on('close', (truncateCode) => {
          if (truncateCode !== 0) {
            const error = new Error(
              `psql truncate process exited with code ${truncateCode}`
            )
            logger.error({ error }, 'Failed to truncate CloudflareImage table')
            reject(error)
            return
          }

          logger.info('CloudflareImage table truncated, now importing data')

          // Then import the data using the COPY command
          const copyProcess = spawn(
            'psql',
            [
              '-h',
              host,
              '-p',
              port,
              '-U',
              username,
              '-d',
              database,
              '-c',
              `\\COPY "CloudflareImage" FROM '${tempFilePath}' WITH CSV HEADER`
            ],
            { env }
          )

          copyProcess.stdout.on('data', (data) => {
            logger.info(`psql copy stdout: ${data}`)
          })

          copyProcess.stderr.on('data', (data) => {
            logger.info(`psql copy stderr: ${data}`)
          })

          copyProcess.on('close', (copyCode) => {
            // Clean up the temporary file
            fsPromises.unlink(tempFilePath).catch((err) => {
              logger.warn({ error: err }, 'Failed to remove temporary file')
            })

            if (copyCode === 0) {
              logger.info('CloudflareImage data imported successfully')
              resolve()
            } else {
              const error = new Error(
                `psql copy process exited with code ${copyCode}`
              )
              logger.error({ error }, 'Failed to import CloudflareImage data')
              reject(error)
            }
          })

          copyProcess.on('error', (error) => {
            logger.error({ error }, 'Error spawning psql copy process')
            reject(error)
          })
        })

        truncateProcess.on('error', (error) => {
          logger.error({ error }, 'Error spawning psql truncate process')
          reject(error)
        })
      })
      .catch((err) => {
        const error = err instanceof Error ? err : new Error(String(err))
        logger.error({ error }, 'Error decompressing CloudflareImage data')
        reject(error)
      })
  })
}

/**
 * Imports data from backup files into the database
 */
export const service = async (customLogger?: Logger): Promise<void> => {
  const logger = customLogger ?? baseLogger.child({ worker: 'dataImport' })

  try {
    if (!process.env.DB_SEED_PATH) {
      throw new Error('DB_SEED_PATH environment variable is not set')
    }

    const baseUrl = process.env.DB_SEED_PATH
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      throw new Error(
        'DB_SEED_PATH must be a valid URL starting with http:// or https://'
      )
    }

    const tempDir = join(process.cwd(), 'imports')
    await fsPromises.mkdir(tempDir, { recursive: true })

    // Ensure URL ends with a trailing slash if it doesn't have one
    const seedUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`

    // Create URLs for files to download
    const backupFileUrl = new URL(BACKUP_FILE_NAME, seedUrl).toString()
    const cloudflareImageFileUrl = new URL(
      CLOUDFLARE_IMAGES_FILE_NAME,
      seedUrl
    ).toString()

    // Prepare local file paths
    const fileToImport = join(tempDir, BACKUP_FILE_NAME)
    const cloudflareImageFile = join(tempDir, CLOUDFLARE_IMAGES_FILE_NAME)

    // Download the files
    logger.info('Downloading database backup and CloudflareImage data files')
    await downloadFile(backupFileUrl, fileToImport, logger)
    await downloadFile(cloudflareImageFileUrl, cloudflareImageFile, logger)

    // Restore main database backup first
    await executePgRestore(fileToImport, logger)

    // Then import CloudflareImage data
    await importCloudflareImageData(cloudflareImageFile, logger)

    // Update import times
    await prisma.importTimes.upsert({
      where: { modelName: 'dataImport' },
      update: { lastImport: new Date() },
      create: { modelName: 'dataImport', lastImport: new Date() }
    })

    // Clean up downloaded files
    await fsPromises.unlink(fileToImport)
    await fsPromises.unlink(cloudflareImageFile)

    logger.info('Database import completed successfully')
  } catch (error) {
    logger.error({ error }, 'Error during database import')
    throw error
  }
}
