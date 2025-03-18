import { spawn } from 'child_process'
import fs, { promises as fsPromises } from 'fs'
import { basename, join } from 'path'

import {
  CopyObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'
import { Logger } from 'pino'

import { logger as baseLogger } from '../../../logger'

/**
 * This data export service is configured to run automatically on a daily schedule.
 * It runs at midnight every day (as configured in config.ts with EVERY_DAY_AT_MIDNIGHT).
 * No manual invocation is needed for this service.
 */

const BACKUP_FILE_NAME = 'media-backup.pgdump'
const CLOUDFLARE_IMAGES_FILE_NAME = 'cloudflareImage-system-data.sql.gz'
// Tables to exclude from the export
const EXCLUDED_TABLES = [
  'CloudflareImage',
  'MuxVideo',
  'CloudflareR2',
  'UserMediaRole'
]

function getS3Client(): S3Client {
  if (process.env.CLOUDFLARE_R2_ENDPOINT == null)
    throw new Error('Missing CLOUDFLARE_R2_ENDPOINT')
  if (process.env.CLOUDFLARE_R2_ACCESS_KEY_ID == null)
    throw new Error('Missing CLOUDFLARE_R2_ACCESS_KEY_ID')
  if (process.env.CLOUDFLARE_R2_SECRET == null)
    throw new Error('Missing CLOUDFLARE_R2_SECRET')

  return new S3Client({
    region: 'auto',
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET
    }
  })
}

/**
 * Checks if a file exists in R2 and creates a backup if it does
 */
async function backupExistingFile(
  client: S3Client,
  bucket: string,
  key: string,
  logger: Logger
): Promise<void> {
  try {
    // Check if file exists
    await client.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: key
      })
    )

    // If we get here, file exists, so create backup
    logger.info(`Creating backup of existing file at ${key}`)
    await client.send(
      new CopyObjectCommand({
        Bucket: bucket,
        CopySource: `${bucket}/${key}`,
        Key: `${key}.bak`
      })
    )
    logger.info('Backup created successfully')
  } catch (error) {
    // If file doesn't exist, that's fine, just continue
    logger.info(`No existing file found at ${key}`)
  }
}

/**
 * Uploads a file to R2
 */
async function uploadToR2(
  filePath: string,
  logger: Logger,
  customKey?: string
): Promise<void> {
  if (process.env.CLOUDFLARE_R2_BUCKET == null)
    throw new Error('Missing CLOUDFLARE_R2_BUCKET')

  const fileContent = await fsPromises.readFile(filePath)
  const client = getS3Client()

  // Determine the key based on the filename
  const filename = customKey ?? basename(filePath)
  const key = `backups/${filename}`

  logger.info(`Checking for existing file at ${key}`)
  await backupExistingFile(
    client,
    process.env.CLOUDFLARE_R2_BUCKET,
    key,
    logger
  )

  logger.info(`Uploading to R2 at key: ${key}`)
  await client.send(
    new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET,
      Key: key,
      Body: fileContent,
      ContentType: 'application/gzip'
    })
  )

  logger.info('Upload to R2 completed')
}

/**
 * Executes pg_dump command to create a database backup
 * Excludes specified tables
 */
async function executePgDump(
  outputFile: string,
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

    // Generate exclude table arguments
    const excludeTableArgs = EXCLUDED_TABLES.flatMap((table) => [
      '--exclude-table',
      table
    ])

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
      'c', // Custom format (compressed binary file)
      '-Z',
      '9', // Maximum compression level
      '--no-owner',
      '--no-privileges',
      ...excludeTableArgs,
      '-f',
      outputFile
    ]

    logger.info('Starting database export with filters')
    logger.info(
      {
        excludedTables: EXCLUDED_TABLES
      },
      'Export filters'
    )

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
 * Export CloudflareImage data where userId is 'system'
 */
async function exportCloudflareImageData(
  exportDir: string,
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

    logger.info('Starting CloudflareImage data export')

    // Define file paths
    const csvFilePath = join(exportDir, 'cloudflareImage-system-data.csv')
    const gzipFilePath = join(exportDir, 'cloudflareImage-system-data.sql.gz')

    // Export the data
    logger.info('Exporting CloudflareImage data to CSV')

    const exportCmd = `
      COPY (
        SELECT *
        FROM "CloudflareImage" 
        WHERE "videoId" IS NOT NULL
      ) TO '${csvFilePath}' WITH CSV HEADER
    `

    const exportProcess = spawn(
      'psql',
      ['-h', host, '-p', port, '-U', username, '-d', database, '-c', exportCmd],
      { env }
    )

    let exportError = ''
    exportProcess.stderr.on('data', (data) => {
      exportError += data.toString()
    })

    exportProcess.on('close', (exportCode) => {
      if (exportCode !== 0) {
        logger.error(`Export failed with code ${exportCode}`)
        reject(new Error(`Export failed: ${exportError}`))
        return
      }

      // Check if the export worked
      fs.stat(csvFilePath, (statErr, stats) => {
        if (statErr) {
          logger.error({ error: statErr }, 'Failed to get CSV file stats')
          reject(statErr)
          return
        }

        if (stats.size === 0) {
          return
        }

        // Compress the file
        compressFile(csvFilePath, gzipFilePath, logger, resolve, reject)
      })
    })

    exportProcess.on('error', (error) => {
      logger.error({ error }, 'Export process error')
      reject(error)
    })
  })
}

/**
 * Helper function to compress a file
 */
function compressFile(
  inputFile: string,
  outputFile: string,
  logger: Logger,
  resolve: () => void,
  reject: (error: Error) => void
): void {
  logger.info(`Compressing ${inputFile} to ${outputFile}`)

  const gzipProcess = spawn('gzip', ['-c', inputFile])
  const outputStream = fs.createWriteStream(outputFile)

  gzipProcess.stdout.pipe(outputStream)

  let gzipError = ''
  gzipProcess.stderr.on('data', (data) => {
    gzipError += data.toString()
  })

  gzipProcess.on('close', (gzipCode) => {
    if (gzipCode !== 0) {
      logger.error(`Gzip failed with code ${gzipCode}`)
      reject(new Error(`Compression failed: ${gzipError}`))
      return
    }

    // Delete the original file
    fs.unlink(inputFile, (unlinkErr) => {
      if (unlinkErr) {
        logger.warn({ error: unlinkErr }, 'Failed to remove original CSV file')
      }

      // Verify the compressed file exists and is not empty
      fs.stat(outputFile, (statErr, stats) => {
        if (statErr) {
          logger.error({ error: statErr }, 'Failed to get gzipped file stats')
          reject(statErr)
          return
        }

        if (stats.size === 0) {
          logger.error('Gzipped file is empty')
          reject(new Error('Gzipped file is empty'))
          return
        }

        logger.info('CloudflareImage data export completed successfully')
        resolve()
      })
    })
  })

  gzipProcess.on('error', (error) => {
    logger.error({ error }, 'Gzip process error')
    reject(error)
  })
}

/**
 * Export data from the media database to backup files
 */
export const service = async (customLogger?: Logger): Promise<void> => {
  const logger = customLogger ?? baseLogger.child({ worker: 'dataExport' })

  try {
    const outputDir = join(process.cwd(), 'exports')
    await fsPromises.mkdir(outputDir, { recursive: true })

    const outputFile = join(outputDir, BACKUP_FILE_NAME)
    const cloudflareImageFile = join(outputDir, CLOUDFLARE_IMAGES_FILE_NAME)

    // Generate database backup
    await executePgDump(outputFile, logger)

    // Export CloudflareImage data with system userId
    await exportCloudflareImageData(outputDir, logger)

    // Upload to R2
    await uploadToR2(outputFile, logger)
    await uploadToR2(cloudflareImageFile, logger)

    // Clean up local files
    await fsPromises.unlink(outputFile)
    await fsPromises.unlink(cloudflareImageFile)

    logger.info('Database export and upload completed successfully')
  } catch (error) {
    logger.error({ error }, 'Error during database export')
    throw error
  }
}
