import { spawn } from 'child_process'
import { promises as fs } from 'fs'
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
    logger.info(`Creating backup of existing file: ${key}`)
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
    logger.info(`No existing file found: ${key}`)
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
  const key = `backups/${BACKUP_FILE_NAME}`

  logger.info('Checking for existing backup file')
  await backupExistingFile(
    client,
    process.env.CLOUDFLARE_R2_BUCKET,
    key,
    logger
  )

  logger.info('Uploading to R2')
  await client.send(
    new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET,
      Key: key,
      Body: fileContent,
      ContentType: 'application/x-gzip'
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

    logger.info('Starting pg_dump process')
    logger.info({ args }, 'pg_dump args')
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
 * Exports CloudflareImage table with system userId using psql
 */
async function exportCloudflareImageSystemData(
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

    // SQL command to export only the CloudflareImage records with userId = 'system'
    const sqlCommand = `\\COPY (SELECT * FROM "CloudflareImage" WHERE "userId" = 'system') TO STDOUT WITH CSV HEADER`

    logger.info('Starting CloudflareImage system data export')

    const psql = spawn(
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
        sqlCommand
      ],
      { env }
    )

    // Create gzip stream and write to file
    const gzip = createGzip()
    const writeStreamPromise = fs
      .open(outputFile, 'w')
      .then((fileHandle) => fileHandle.createWriteStream())
      .catch((err) => {
        const error = err instanceof Error ? err : new Error(String(err))
        logger.error({ error }, 'Failed to open output file')
        reject(error)
        return null
      })

    // Once we have the write stream, set up the pipeline
    void writeStreamPromise.then((stream) => {
      if (!stream) return // Handle case where opening file failed

      // Set up pipeline: psql stdout -> gzip -> file
      pipeline(psql.stdout, gzip, stream)
        .then(() => {
          logger.info('CloudflareImage data export completed and compressed')
          resolve()
        })
        .catch((err) => {
          const error = err instanceof Error ? err : new Error(String(err))
          logger.error({ error }, 'Error in export pipeline')
          reject(error)
        })
    })

    psql.stderr.on('data', (data) => {
      logger.info(`psql: ${data}`)
    })

    psql.on('error', (err) => {
      const error = err instanceof Error ? err : new Error(String(err))
      logger.error({ error }, 'Error spawning psql process')
      reject(error)
    })

    psql.on('close', (code) => {
      if (code !== 0 && code !== null) {
        const error = new Error(`psql process exited with code ${code}`)
        logger.error({ error }, 'Failed to export CloudflareImage data')
        reject(error)
      }
      // Success case is handled by the pipeline completion
    })
  })
}

/**
 * Uploads CloudflareImage data to R2
 */
async function uploadCloudflareImageData(
  filePath: string,
  logger: Logger
): Promise<void> {
  if (process.env.CLOUDFLARE_R2_BUCKET == null)
    throw new Error('Missing CLOUDFLARE_R2_BUCKET')

  const fileContent = await fs.readFile(filePath)
  const client = getS3Client()
  const key = `backups/${CLOUDFLARE_IMAGES_FILE_NAME}`

  logger.info('Checking for existing CloudflareImage data file')
  await backupExistingFile(
    client,
    process.env.CLOUDFLARE_R2_BUCKET,
    key,
    logger
  )

  logger.info('Uploading CloudflareImage data to R2')
  await client.send(
    new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET,
      Key: key,
      Body: fileContent,
      ContentType: 'application/gzip'
    })
  )
  logger.info('CloudflareImage data upload completed')
}

/**
 * Exports database to a pgdump file and uploads it to R2
 * Excludes specified tables and separately exports CloudflareImage records with system userId
 */
export const service = async (customLogger?: Logger): Promise<void> => {
  const logger = customLogger ?? baseLogger.child({ worker: 'dataExport' })

  try {
    const outputDir = join(process.cwd(), 'exports')
    await fs.mkdir(outputDir, { recursive: true })

    const outputFile = join(outputDir, BACKUP_FILE_NAME)
    const cloudflareImageFile = join(outputDir, CLOUDFLARE_IMAGES_FILE_NAME)

    await executePgDump(outputFile, logger)
    await exportCloudflareImageSystemData(cloudflareImageFile, logger)

    await uploadToR2(outputFile, logger)
    await uploadCloudflareImageData(cloudflareImageFile, logger)

    // Clean up local files
    await fs.unlink(outputFile)
    await fs.unlink(cloudflareImageFile)

    logger.info('Database export and upload completed successfully')
  } catch (error) {
    logger.error({ error }, 'Error during database export')
    throw error
  }
}
