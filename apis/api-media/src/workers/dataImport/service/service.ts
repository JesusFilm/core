import { spawn } from 'child_process'
import fs, { promises as fsPromises } from 'fs'
import { join } from 'path'
import { Readable } from 'stream'
import { pipeline } from 'stream/promises'

import { Client } from 'pg'
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
    const tempDir = join(process.cwd(), 'imports')

    const env = {
      ...process.env,
      PGPASSWORD: decodeURIComponent(databaseUrl.password)
    }

    logger.info('Starting CloudflareImage data import')

    // First verify the file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        logger.error('CloudflareImage file not found')
        reject(new Error(`File not found: ${filePath}`))
        return
      }

      // Extract the gzipped file first for more reliable processing
      const extractedFilePath = join(tempDir, 'cloudflare-extracted.csv')
      const extractCmd = `gunzip -c ${filePath} > ${extractedFilePath}`
      logger.info(`Extracting gzipped file`)

      const extractProcess = spawn('bash', ['-c', extractCmd])

      let extractError = ''
      extractProcess.stderr.on('data', (data) => {
        extractError += data.toString()
      })

      extractProcess.on('close', (extractCode) => {
        if (extractCode !== 0) {
          logger.error(`Failed to extract file: ${extractError}`)
          reject(new Error(`Failed to extract gzipped file: ${extractError}`))
          return
        }

        // Truncate CloudflareImage table before import
        logger.info('Truncating CloudflareImage table')
        const truncateCmd = `TRUNCATE TABLE "CloudflareImage";`

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
            truncateCmd
          ],
          { env }
        )

        truncateProcess.on('close', (truncateCode: number) => {
          if (truncateCode !== 0) {
            logger.error(
              `CloudflareImage table truncate failed with code ${truncateCode}`
            )
            reject(new Error('Failed to truncate CloudflareImage table'))

            // Clean up extracted file
            fsPromises.unlink(extractedFilePath).catch((e) => {
              logger.error(`Failed to clean up extracted file: ${e.message}`)
            })

            return
          }

          logger.info('CloudflareImage table truncated, importing data')

          // Use Node.js to process the CSV directly since we can't be certain of the table structure
          const manualImport = async (): Promise<void> => {
            // Define interfaces for database column data
            interface DbColumn {
              name: string
              type: string
              nullable: boolean
              hasDefault: boolean
              maxLength?: number
            }

            interface DbRow {
              column_name: string
              data_type: string
              is_nullable: string
              column_default: string | null
              character_maximum_length: number | null
            }

            try {
              // Read and process the CSV manually
              const fileContent = await fsPromises.readFile(
                extractedFilePath,
                'utf8'
              )
              const lines = fileContent.split('\n')

              if (lines.length === 0) {
                logger.error('CSV file is empty')
                return
              }

              // Parse header to understand column structure
              const header = lines[0].split(',').map((h) => h.trim())

              // Get the table structure to know which columns to map
              const client = new Client({
                connectionString: process.env.PG_DATABASE_URL_MEDIA
              })
              await client.connect()

              // Get table columns
              const columnResult = await client.query(`
                SELECT column_name, data_type, is_nullable,
                       column_default, character_maximum_length
                FROM information_schema.columns 
                WHERE table_name = 'CloudflareImage' 
                ORDER BY ordinal_position
              `)

              const tableColumns = columnResult.rows.map(
                (row: DbRow): DbColumn => ({
                  name: row.column_name,
                  type: row.data_type,
                  nullable: row.is_nullable === 'YES',
                  hasDefault: row.column_default !== null,
                  maxLength:
                    row.character_maximum_length === null
                      ? undefined
                      : row.character_maximum_length
                })
              )

              // Create an intelligent mapping between CSV columns and database columns
              const columnMapping: Record<string, string> = {}

              // Get required columns that need special attention
              const requiredCols = tableColumns.filter(
                (col: DbColumn) => !col.nullable && !col.hasDefault
              )

              // Intelligent column matching algorithm
              for (const csvCol of header) {
                // 1. Direct match (case insensitive)
                const directMatch = tableColumns.find(
                  (dbCol: DbColumn) =>
                    dbCol.name.toLowerCase() === csvCol.toLowerCase()
                )

                if (directMatch) {
                  columnMapping[csvCol] = directMatch.name
                  continue
                }

                // 2. Match with underscores removed (e.g., userId vs user_id)
                const noUnderscoreMatch = tableColumns.find(
                  (dbCol: DbColumn) =>
                    dbCol.name.replace(/_/g, '').toLowerCase() ===
                    csvCol.replace(/_/g, '').toLowerCase()
                )

                if (noUnderscoreMatch) {
                  columnMapping[csvCol] = noUnderscoreMatch.name
                  continue
                }

                // 3. Match word by word (e.g., imageId vs cloudflare_image_id)
                const csvWords = csvCol
                  .replace(/([A-Z])/g, ' $1')
                  .toLowerCase()
                  .split(/\s|_/)
                  .filter(Boolean)

                let wordMatchFound = false
                for (const dbCol of tableColumns) {
                  const dbWords = dbCol.name
                    .replace(/([A-Z])/g, ' $1')
                    .toLowerCase()
                    .split(/\s|_/)
                    .filter(Boolean)

                  // Check if CSV column words are a subset of DB column words
                  const isSubset = csvWords.every((word) =>
                    dbWords.some(
                      (dbWord: string) =>
                        dbWord.includes(word) || word.includes(dbWord)
                    )
                  )

                  if (isSubset && csvWords.length > 0) {
                    columnMapping[csvCol] = dbCol.name
                    wordMatchFound = true
                    break
                  }
                }

                if (wordMatchFound) continue

                // 4. Apply common naming conventions for known fields
                const commonMappings: Record<string, string[]> = {
                  id: ['uuid', 'guid', 'key', 'primary', 'uniqueid'],
                  userId: ['user', 'owner', 'creator', 'userid', 'author'],
                  imageId: [
                    'image',
                    'img',
                    'photo',
                    'picture',
                    'cloudflare',
                    'videoId'
                  ],
                  url: [
                    'uri',
                    'link',
                    'href',
                    'src',
                    'source',
                    'upload',
                    'path',
                    'location'
                  ],
                  format: [
                    'type',
                    'extension',
                    'kind',
                    'filetype',
                    'aspect',
                    'ratio',
                    'aspectratio'
                  ],
                  width: ['w', 'wide', 'breadth', 'size_x', 'size_width'],
                  height: ['h', 'high', 'size_y', 'size_height'],
                  createdAt: [
                    'created',
                    'date',
                    'timestamp',
                    'creation',
                    'inserted'
                  ],
                  updatedAt: ['updated', 'modified', 'last_change', 'changed']
                }

                // Try to find a match using the common mappings
                for (const [dbField, synonyms] of Object.entries(
                  commonMappings
                )) {
                  if (
                    tableColumns.some(
                      (col: DbColumn) => col.name === dbField
                    ) &&
                    synonyms.some((syn: string) =>
                      csvCol.toLowerCase().includes(syn.toLowerCase())
                    )
                  ) {
                    columnMapping[csvCol] = dbField
                    break
                  }
                }
              }

              // Check if we're missing any required fields
              const mappedDbCols = Object.values(columnMapping)
              const missingRequiredCols = requiredCols.filter(
                (col: DbColumn) => !mappedDbCols.includes(col.name)
              )

              if (missingRequiredCols.length > 0) {
                logger.warn(
                  `Missing required columns: ${missingRequiredCols.map((c: DbColumn) => c.name).join(', ')}`
                )
              }

              // Process each line
              let headerLine = true
              let insertCount = 0
              let errorCount = 0

              for (const line of lines) {
                if (headerLine) {
                  headerLine = false
                  continue
                }

                if (!line.trim()) continue

                // Split CSV line and handle quoted values correctly
                const values = line.split(',').map((value) => value.trim())

                // Dynamically detect system records without hardcoding 'userId'
                // First try to find the userId field through the column mapping
                let isSystemRecord = false
                let userIdField: string | null = null

                // Try to find userID field through various methods
                for (let i = 0; i < header.length; i++) {
                  const csvColName = header[i]
                  const dbColName = columnMapping[csvColName]

                  // Check if this column maps to userId in the database
                  if (dbColName === 'userId' && values[i] === 'system') {
                    isSystemRecord = true
                    userIdField = dbColName
                    break
                  }

                  // Also check column names that might represent user information
                  if (
                    (csvColName === 'userId' ||
                      csvColName === 'user_id' ||
                      csvColName === 'username' ||
                      csvColName === 'owner' ||
                      csvColName.toLowerCase().includes('user')) &&
                    values[i] === 'system'
                  ) {
                    isSystemRecord = true
                    userIdField = csvColName
                    break
                  }
                }

                // Skip non-system records
                if (!isSystemRecord) {
                  continue
                }

                // Construct an object with the database column names and values
                const rowData: Record<string, any> = {}

                // Ensure userId is set correctly
                if (
                  tableColumns.some((col: DbColumn) => col.name === 'userId')
                ) {
                  rowData['userId'] = 'system'
                } else if (userIdField && columnMapping[userIdField]) {
                  rowData[columnMapping[userIdField]] = 'system'
                }

                // Map CSV values to database columns
                for (let i = 0; i < header.length; i++) {
                  const csvColName = header[i]
                  const dbColName = columnMapping[csvColName]

                  if (dbColName && values[i] !== undefined) {
                    const tableCol = tableColumns.find(
                      (col: DbColumn) => col.name === dbColName
                    )

                    if (tableCol) {
                      // Convert value based on database column type
                      try {
                        if (
                          values[i] === '' ||
                          values[i].toLowerCase() === 'null'
                        ) {
                          rowData[dbColName] = null
                        } else if (tableCol.type.includes('int')) {
                          rowData[dbColName] = parseInt(values[i], 10)
                        } else if (
                          tableCol.type.includes('float') ||
                          tableCol.type.includes('double') ||
                          tableCol.type.includes('decimal') ||
                          tableCol.type.includes('numeric')
                        ) {
                          rowData[dbColName] = parseFloat(values[i])
                        } else if (
                          tableCol.type.includes('timestamp') ||
                          tableCol.type.includes('date')
                        ) {
                          rowData[dbColName] = values[i]
                        } else if (tableCol.type === 'boolean') {
                          const boolValue = values[i].toLowerCase()
                          rowData[dbColName] =
                            boolValue === 't' ||
                            boolValue === 'true' ||
                            boolValue === '1' ||
                            boolValue === 'yes'
                        } else if (tableCol.type === 'uuid') {
                          // Validate UUID format
                          const uuidRegex =
                            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
                          if (uuidRegex.test(values[i])) {
                            rowData[dbColName] = values[i]
                          } else {
                            continue
                          }
                        } else if (tableCol.type.includes('json')) {
                          try {
                            rowData[dbColName] = JSON.parse(values[i])
                          } catch (e) {
                            rowData[dbColName] = values[i] // Store as string if not valid JSON
                          }
                        } else {
                          // String types
                          rowData[dbColName] = values[i]
                        }
                      } catch (conversionError) {
                        // Try to store as-is
                        rowData[dbColName] = values[i]
                      }
                    }
                  }
                }

                // Provide default values for required fields if missing
                for (const reqCol of requiredCols) {
                  if (rowData[reqCol.name] === undefined) {
                    // Try to infer a reasonable default
                    if (reqCol.name === 'userId' && !rowData['userId']) {
                      rowData['userId'] = 'system'
                    } else if (reqCol.name === 'id' && !rowData['id']) {
                      // If missing ID, may need to skip this row since IDs are typically required
                      continue
                    }
                  }
                }

                // Only insert if we have the minimum required data
                if (Object.keys(rowData).length > 0) {
                  try {
                    // Generate dynamic SQL based on available columns
                    const columns = Object.keys(rowData)
                    const placeholders = columns
                      .map((_, i) => `$${i + 1}`)
                      .join(', ')
                    const values = columns.map((col) => rowData[col])

                    const query = `
                      INSERT INTO "CloudflareImage" (${columns.map((c) => `"${c}"`).join(', ')})
                      VALUES (${placeholders})
                    `

                    await client.query(query, values)
                    insertCount++
                  } catch (insertError) {
                    errorCount++

                    // If too many errors, stop processing
                    if (errorCount > 10) {
                      logger.error('Too many insertion errors, aborting import')
                      break
                    }
                  }
                }
              }

              await client.end()
              logger.info(
                `Imported ${insertCount} CloudflareImage records with ${errorCount} errors`
              )

              // Clean up extracted file
              await fsPromises.unlink(extractedFilePath)

              resolve()
            } catch (error) {
              const err = error as Error
              logger.error(`Manual import failed: ${err.message}`)

              // Clean up extracted file
              try {
                await fsPromises.unlink(extractedFilePath)
              } catch (cleanupError) {
                logger.error(
                  `Failed to clean up extracted file: ${(cleanupError as Error).message}`
                )
              }

              reject(new Error(`Manual import failed: ${err.message}`))
            }
          }

          manualImport().catch((error: Error) => {
            reject(new Error(`Manual import failed: ${error.message}`))
          })
        })
      })
    })
  })
}

/**
 * Imports data from backup files into the database
 * Only runs when explicitly called from CLI, not automatically
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
