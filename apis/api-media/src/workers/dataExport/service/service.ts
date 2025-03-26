import { spawn } from 'child_process'
import fs, { promises as fsPromises } from 'fs'
import { basename, join } from 'path'
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

/**
 * This data export service is configured to run automatically on a daily schedule.
 * It runs at midnight every day (as configured in config.ts with EVERY_DAY_AT_MIDNIGHT).
 * No manual invocation is needed for this service.
 */

const SQL_BACKUP_FILE_NAME = 'media-backup.sql'
const GZIPPED_BACKUP_FILE_NAME = 'media-backup.sql.gz'
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
 * Executes pg_dump command to create a SQL dump in PLAIN format
 * Uses INSERT statements instead of COPY for better portability
 * Excludes specified tables
 */
async function executePgDump(
  outputFile: string,
  logger: Logger
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const databaseUrl = new URL(process.env.PG_DATABASE_URL_MEDIA ?? '')
      const host = databaseUrl.hostname
      const port = databaseUrl.port || '5432'
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
        'p', // PLAIN format (SQL statements) for psql compatibility
        '--inserts', // Use INSERT instead of COPY to avoid permission issues
        '--no-owner',
        '--no-privileges',
        '--no-publications', // Exclude publications from export
        '--no-subscriptions', // Exclude subscriptions from export
        ...excludeTableArgs,
        '-f',
        outputFile
      ]

      logger.info('Starting database export with filters')
      logger.info(
        {
          excludedTables: EXCLUDED_TABLES,
          format: 'PLAIN SQL with INSERT statements'
        },
        'Export filters'
      )

      const dump = spawn('pg_dump', args, { env })

      let stderrData = ''
      dump.stderr.on('data', (data) => {
        const chunk = data.toString()
        stderrData += chunk
      })

      dump.on('close', (code) => {
        if (code === 0) {
          // Verify the SQL file exists and has content
          fsPromises.stat(outputFile).then(
            (stats) => {
              if (stats.size === 0) {
                logger.error('SQL file is empty')
                reject(new Error('SQL file is empty'))
              } else {
                logger.info(
                  `Database export completed: ${outputFile} (${stats.size} bytes)`
                )
                resolve()
              }
            },
            (error) => {
              logger.error({ error }, 'Failed to get SQL file stats')
              reject(error instanceof Error ? error : new Error(String(error)))
            }
          )
        } else {
          const error = new Error(`pg_dump process exited with code ${code}`)
          logger.error({ error }, 'Failed to export database')
          if (stderrData) {
            logger.error(`pg_dump stderr: ${stderrData}`)
          }
          reject(error)
        }
      })

      dump.on('error', (error) => {
        logger.error({ error }, 'Error spawning pg_dump process')
        reject(error instanceof Error ? error : new Error(String(error)))
      })
    } catch (error) {
      logger.error({ error }, 'Error in pg_dump execution setup')
      reject(error instanceof Error ? error : new Error(String(error)))
    }
  })
}

/**
 * Export CloudflareImage data where videoId is not null
 */
async function exportCloudflareImageData(
  exportDir: string,
  logger: Logger
): Promise<string> {
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
    const sqlFilePath = join(exportDir, 'cloudflareImage-system-data.sql')
    const gzipFilePath = join(exportDir, CLOUDFLARE_IMAGES_FILE_NAME)

    // Create a temporary SQL file for the export
    const createViewArgs = [
      '-h',
      host,
      '-p',
      port,
      '-U',
      username,
      '-d',
      database,
      '-c',
      'CREATE OR REPLACE VIEW temp_cloudflare_export AS SELECT * FROM "CloudflareImage" WHERE "videoId" IS NOT NULL;'
    ]

    // First create a temporary view for our filtered data
    const createViewProcess = spawn('psql', createViewArgs, { env })

    let createViewError = ''
    createViewProcess.stderr.on('data', (data) => {
      const chunk = data.toString()
      createViewError += chunk
    })

    createViewProcess.on('close', (createViewCode) => {
      if (createViewCode !== 0) {
        logger.error(`Create view failed with code ${createViewCode}`)
        reject(new Error(`Create view failed: ${createViewError}`))
        return
      }

      // Now export the view data
      const exportArgs = [
        '-h',
        host,
        '-p',
        port,
        '-U',
        username,
        '-d',
        database,
        '-t',
        'temp_cloudflare_export',
        '-F',
        'p',
        '--inserts',
        '--no-owner',
        '--no-privileges',
        '--no-publications', // Exclude publications from export
        '--no-subscriptions', // Exclude subscriptions from export
        '--data-only',
        '--column-inserts',
        '-f',
        sqlFilePath
      ]

      const exportProcess = spawn('pg_dump', exportArgs, { env })

      let exportError = ''
      exportProcess.stderr.on('data', (data) => {
        const chunk = data.toString()
        exportError += chunk
      })

      exportProcess.on('close', (exportCode) => {
        if (exportCode !== 0) {
          logger.error(`Export failed with code ${exportCode}`)
          reject(new Error(`Export failed: ${exportError}`))
          return
        }

        // Clean up the temporary view
        const dropViewCmd = `
          psql -h ${host} -p ${port} -U ${username} -d ${database} -c "DROP VIEW IF EXISTS temp_cloudflare_export;"
        `

        spawn('sh', ['-c', dropViewCmd], { env })

        // Check if the export worked
        fs.stat(sqlFilePath, (statErr, stats) => {
          if (statErr) {
            logger.error({ error: statErr }, 'Failed to get SQL file stats')
            reject(
              statErr instanceof Error ? statErr : new Error(String(statErr))
            )
            return
          }

          if (stats.size === 0) {
            logger.warn('Generated SQL file is empty')
            resolve(gzipFilePath) // Return even if empty to continue the process
            return
          }

          // Update table name in the SQL file to match the original table
          const sed = `
            sed -i 's/temp_cloudflare_export/CloudflareImage/g' ${sqlFilePath}
          `

          const sedProcess = spawn('sh', ['-c', sed], { env })

          sedProcess.on('close', (sedCode) => {
            if (sedCode !== 0) {
              logger.warn('Failed to update table name in SQL file')
            }

            // Compress the file
            compressFile(sqlFilePath, gzipFilePath, logger)
              .then(() => {
                // Clean up uncompressed file
                fs.unlink(sqlFilePath, (unlinkErr) => {
                  if (unlinkErr) {
                    logger.warn(
                      { error: unlinkErr },
                      'Failed to remove uncompressed SQL file'
                    )
                  }
                })
                resolve(gzipFilePath)
              })
              .catch((error) => {
                logger.error({ error }, 'Failed to compress SQL file')
                reject(
                  error instanceof Error ? error : new Error(String(error))
                )
              })
          })
        })
      })

      exportProcess.on('error', (error) => {
        logger.error({ error }, 'Export process error')
        reject(error instanceof Error ? error : new Error(String(error)))
      })
    })

    createViewProcess.on('error', (error) => {
      logger.error({ error }, 'Create view process error')
      reject(error instanceof Error ? error : new Error(String(error)))
    })
  })
}

/**
 * Compresses a file using gzip
 */
async function compressFile(
  inputFile: string,
  outputFile: string,
  logger: Logger
): Promise<void> {
  logger.info(`Compressing ${inputFile} to ${outputFile}`)

  try {
    // Create read and write streams
    const source = fs.createReadStream(inputFile)
    const gzip = createGzip()
    const destination = fs.createWriteStream(outputFile)

    // Pipe the file through gzip compression
    await pipeline(source, gzip, destination)

    // Verify the compressed file exists and has content
    const stats = await fsPromises.stat(outputFile)
    if (stats.size === 0) {
      throw new Error('Compressed file is empty')
    }

    logger.info(`Compression completed: ${outputFile} (${stats.size} bytes)`)
  } catch (error) {
    logger.error({ error }, 'Error compressing file')
    throw error instanceof Error ? error : new Error(String(error))
  }
}

/**
 * Post-processes the SQL dump to remove foreign key constraints
 * that reference excluded tables
 */
async function postProcessSqlDump(
  sqlFilePath: string,
  logger: Logger
): Promise<void> {
  logger.info(
    'Post-processing SQL dump to remove references to excluded tables'
  )

  try {
    let content = await fsPromises.readFile(sqlFilePath, 'utf8')

    // Process each excluded table to remove references to it
    for (const excludedTable of EXCLUDED_TABLES) {
      logger.info(
        `Removing foreign key constraints referencing ${excludedTable}`
      )

      // Pattern to match ALTER TABLE statements that add foreign key constraints to excluded tables
      const foreignKeyPattern = new RegExp(
        `ALTER TABLE [^;]+ ADD CONSTRAINT [^;]+ FOREIGN KEY \\([^)]+\\) REFERENCES (public\\.)?"?${excludedTable}"?[^;]*;`,
        'g'
      )

      // Remove foreign key constraints
      const originalContent = content
      content = content.replace(
        foreignKeyPattern,
        `-- Removed foreign key constraint referencing ${excludedTable}\n`
      )

      const replacementCount = (originalContent.match(foreignKeyPattern) || [])
        .length
      if (replacementCount > 0) {
        logger.info(
          `Removed ${replacementCount} foreign key constraints referencing ${excludedTable}`
        )
      }
    }

    await fsPromises.writeFile(sqlFilePath, content)
    logger.info('SQL dump post-processing completed')
  } catch (error) {
    logger.error({ error }, 'Error post-processing SQL dump')
    throw error instanceof Error ? error : new Error(String(error))
  }
}

/**
 * Export data from the media database to backup files
 */
export const service = async (customLogger?: Logger): Promise<void> => {
  const logger = customLogger ?? baseLogger.child({ worker: 'data-export' })
  logger.info('Starting data export worker')

  try {
    if (!process.env.PG_DATABASE_URL_MEDIA) {
      throw new Error('Database URL is not configured')
    }

    // Directory for temporary files
    const exportDir = join(process.cwd(), 'exports')
    await fsPromises.mkdir(exportDir, { recursive: true })
    logger.info(`Created export directory: ${exportDir}`)

    // Full paths to output files
    const sqlFile = join(exportDir, SQL_BACKUP_FILE_NAME)
    const gzippedFile = join(exportDir, GZIPPED_BACKUP_FILE_NAME)

    // Execute the database export with pg_dump
    await executePgDump(sqlFile, logger)

    // Post-process the SQL dump to remove foreign key constraints to excluded tables
    await postProcessSqlDump(sqlFile, logger)

    // Compress the SQL file
    await compressFile(sqlFile, gzippedFile, logger)

    // Upload to R2
    await uploadToR2(gzippedFile, logger)

    // Export CloudflareImage data (for video thumbnails)
    const cloudflareImagesFile = await exportCloudflareImageData(
      exportDir,
      logger
    )
    await uploadToR2(cloudflareImagesFile, logger, CLOUDFLARE_IMAGES_FILE_NAME)

    // Clean up temporary files
    logger.info('Cleaning up temporary files')
    await fsPromises.unlink(sqlFile)
    await fsPromises.unlink(gzippedFile)
    await fsPromises.unlink(cloudflareImagesFile)

    logger.info('Data export completed successfully')
  } catch (error) {
    logger.error({ error }, 'Error during data export')
    throw error instanceof Error ? error : new Error(String(error))
  }
}
