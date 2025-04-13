import { spawn } from 'child_process'
import { createReadStream, createWriteStream, promises as fs } from 'fs'
import { join } from 'path'
import { pipeline } from 'stream/promises'
import { createGzip } from 'zlib'

import {
  CopyObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'
import { Logger } from 'pino'

import { logger as baseLogger } from '../../../logger'

const BACKUP_FILE_NAME = 'languages-backup.sql'
const GZIPPED_BACKUP_FILE_NAME = `${BACKUP_FILE_NAME}.gz`

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
  logger: Logger
): Promise<void> {
  const key = `backups/${GZIPPED_BACKUP_FILE_NAME}`

  try {
    // Check if file exists
    await client.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: key
      })
    )

    // If we get here, file exists, so create backup
    logger.info('Creating backup of existing file')
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
    logger.info('No existing backup file found')
  }
}

/**
 * Compresses a file using gzip
 */
async function compressFile(
  inputFile: string,
  outputFile: string,
  logger: Logger
): Promise<void> {
  logger.info('Compressing file with gzip')

  try {
    const source = createReadStream(inputFile)
    const destination = createWriteStream(outputFile)
    const gzip = createGzip()

    await pipeline(source, gzip, destination)

    logger.info('File compression completed')
  } catch (error) {
    logger.error({ error }, 'Error compressing file')
    throw error
  }
}

/**
 * Uploads a file to R2
 */
async function uploadToR2(filePath: string, logger: Logger): Promise<void> {
  if (process.env.CLOUDFLARE_R2_BUCKET == null)
    throw new Error('Missing CLOUDFLARE_R2_BUCKET')

  const fileContent = await fs.readFile(filePath)
  const client = getS3Client()

  logger.info('Checking for existing backup file')
  await backupExistingFile(client, process.env.CLOUDFLARE_R2_BUCKET, logger)

  logger.info('Uploading to R2')
  await client.send(
    new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET,
      Key: `backups/${GZIPPED_BACKUP_FILE_NAME}`,
      Body: fileContent,
      ContentType: 'application/gzip'
    })
  )

  logger.info('Upload to R2 completed')
}

/**
 * Executes pg_dump command to create a database backup as SQL
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
      PGPASSWORD: decodeURIComponent(databaseUrl.password)
    }

    // Use plain SQL format instead of custom format
    const args = [
      '-h',
      host,
      '-p',
      port,
      '-U',
      username,
      '-d',
      database,
      '--no-owner',
      '--no-privileges',
      '--no-publications',
      '--no-subscriptions',
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
 * Exports database to an SQL file, compresses it with gzip, and uploads it to R2
 */
export const service = async (customLogger?: Logger): Promise<void> => {
  const logger = customLogger ?? baseLogger.child({ worker: 'dataExport' })

  try {
    const outputDir = join(process.cwd(), 'exports')
    await fs.mkdir(outputDir, { recursive: true })

    const outputFile = join(outputDir, BACKUP_FILE_NAME)
    const gzippedOutputFile = join(outputDir, GZIPPED_BACKUP_FILE_NAME)

    await executePgDump(outputFile, logger)
    await compressFile(outputFile, gzippedOutputFile, logger)
    await uploadToR2(gzippedOutputFile, logger)

    // Clean up local files
    await fs.unlink(outputFile)
    await fs.unlink(gzippedOutputFile)

    logger.info(
      'Database export, compression, and upload completed successfully'
    )
  } catch (error) {
    logger.error({ error }, 'Error during database export')
    throw error
  }
}
