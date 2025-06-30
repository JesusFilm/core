import { spawn } from 'child_process'
import fs, { promises as fsPromises } from 'fs'
import { join } from 'path'
import { Readable } from 'stream'
import { pipeline } from 'stream/promises'
import { createGunzip } from 'zlib'

import { prisma } from '../lib/prisma'

const GZIPPED_BACKUP_FILE_NAME = 'languages-backup.sql.gz'
const BACKUP_FILE_NAME = 'languages-backup.sql'
const PROCESSED_BACKUP_FILE_NAME = 'languages-backup-processed.sql'

/**
 * Downloads a file from a URL and saves it locally
 */
async function downloadFile(url: string, outputPath: string): Promise<void> {
  console.log(`Downloading file from ${url}`)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/gzip'
      }
    })

    if (!response.ok) {
      const errorText = await response
        .text()
        .catch(() => 'No error text available')
      console.error(
        `Download failed: ${response.status} ${response.statusText}`
      )
      throw new Error(
        `Failed to download file: ${response.status} ${response.statusText} - ${errorText}`
      )
    }

    if (!response.body) {
      throw new Error('Response body is null')
    }

    const fileStream = fs.createWriteStream(outputPath)
    await pipeline(Readable.fromWeb(response.body as any), fileStream)

    // Verify the file was downloaded and has content
    const stats = await fsPromises.stat(outputPath)
    if (stats.size === 0) {
      throw new Error('Downloaded file is empty')
    }

    console.log('Download completed')
  } catch (error) {
    console.error('Error downloading file:', error)
    throw error
  }
}

/**
 * Decompresses a gzipped file
 */
async function decompressFile(
  inputFile: string,
  outputFile: string
): Promise<void> {
  console.log('Decompressing file')

  try {
    // Verify the input file exists
    try {
      await fsPromises.access(inputFile)
    } catch (error) {
      throw new Error(
        `Input file does not exist or is not accessible: ${inputFile}`
      )
    }

    const source = fs.createReadStream(inputFile)
    const gunzip = createGunzip()
    const destination = fs.createWriteStream(outputFile)

    await pipeline(source, gunzip, destination)

    // Verify the output file exists and has content
    const stats = await fsPromises.stat(outputFile)
    if (stats.size === 0) {
      throw new Error('Decompressed file is empty')
    }

    console.log('File decompression completed')
  } catch (error) {
    console.error('Error decompressing file:', error)
    throw error
  }
}

/**
 * Preprocesses the SQL file to ensure compatibility with existing database
 */
async function preprocessSqlFile(
  inputFile: string,
  outputFile: string
): Promise<void> {
  console.log('Preprocessing SQL file for compatibility')

  try {
    const sqlContent = await fsPromises.readFile(inputFile, 'utf8')

    // Remove all CREATE PUBLICATION statements completely
    const processedContent = sqlContent.replace(
      /CREATE PUBLICATION .* FOR .*;(\r?\n)?/g,
      ''
    )

    await fsPromises.writeFile(outputFile, processedContent)
    console.log('SQL file preprocessing completed')
  } catch (error) {
    console.error('Error preprocessing SQL file:', error)
    throw error
  }
}

/**
 * Executes psql command to restore a database from SQL file
 */
async function executePsql(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Verify the SQL file exists
      void fsPromises
        .access(filePath)
        .catch((error) => {
          reject(
            new Error(
              `SQL file does not exist or is not accessible: ${filePath}`
            )
          )
          return
        })
        .then(() => {
          const databaseUrl = new URL(
            process.env.PG_DATABASE_URL_LANGUAGES ?? ''
          )
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
            '-c',
            'DROP SCHEMA public CASCADE; CREATE SCHEMA public;',
            '-f',
            filePath
          ]

          console.log(`Starting database restore with psql on ${database}`)

          const psql = spawn('psql', args, { env })

          // Collect stderr for error reporting
          let stderrData = ''
          psql.stderr.on('data', (data) => {
            const chunk = data.toString()
            stderrData += chunk
          })

          psql.on('close', (code) => {
            if (code === 0) {
              console.log('Database restore completed successfully')
              resolve()
            } else {
              const error = new Error(`psql process exited with code ${code}`)
              console.error('Failed to restore database:', error)
              if (stderrData) {
                console.error('psql stderr:', stderrData)
              }
              reject(error)
            }
          })

          psql.on('error', (error) => {
            console.error('Error spawning psql process:', error)
            reject(error)
          })
        })
    } catch (error) {
      const wrappedError =
        error instanceof Error ? error : new Error(String(error))
      console.error('Error in psql execution setup:', wrappedError)
      reject(wrappedError)
    }
  })
}

async function main(): Promise<void> {
  let gzippedFile: string | null = null
  let sqlFile: string | null = null
  let processedSqlFile: string | null = null

  try {
    console.log('Starting data import script')

    // Check required environment variables
    if (!process.env.DB_SEED_PATH) {
      throw new Error('DB_SEED_PATH environment variable is not set')
    }
    if (!process.env.PG_DATABASE_URL_LANGUAGES) {
      throw new Error(
        'PG_DATABASE_URL_LANGUAGES environment variable is not set'
      )
    }

    const baseUrl = process.env.DB_SEED_PATH
    // Ensure the base URL ends with a slash if not already
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
    const fullUrl = `${normalizedBaseUrl}${GZIPPED_BACKUP_FILE_NAME}`

    console.log(`Using SQL backup from: ${fullUrl}`)

    try {
      const tempDir = join(process.cwd(), 'imports')
      await fsPromises.mkdir(tempDir, { recursive: true })

      // Download the gzipped SQL file
      gzippedFile = join(tempDir, GZIPPED_BACKUP_FILE_NAME)
      await downloadFile(fullUrl, gzippedFile)

      // Decompress the file
      sqlFile = join(tempDir, BACKUP_FILE_NAME)
      await decompressFile(gzippedFile, sqlFile)

      // Preprocess the SQL file
      processedSqlFile = join(tempDir, PROCESSED_BACKUP_FILE_NAME)
      await preprocessSqlFile(sqlFile, processedSqlFile)

      // Import the SQL file using psql
      await executePsql(processedSqlFile)

      // Update import times
      await prisma.importTimes.upsert({
        where: { modelName: 'dataImport' },
        update: { lastImport: new Date() },
        create: { modelName: 'dataImport', lastImport: new Date() }
      })

      console.log('Data import completed successfully')
      process.exit(0)
    } finally {
      // Clean up temporary files
      try {
        if (gzippedFile) {
          await fsPromises
            .unlink(gzippedFile)
            .catch((err) =>
              console.warn(`Failed to delete temp file: ${gzippedFile}`)
            )
        }
        if (sqlFile) {
          await fsPromises
            .unlink(sqlFile)
            .catch((err) =>
              console.warn(`Failed to delete temp file: ${sqlFile}`)
            )
        }
        if (processedSqlFile) {
          await fsPromises
            .unlink(processedSqlFile)
            .catch((err) =>
              console.warn(`Failed to delete temp file: ${processedSqlFile}`)
            )
        }
      } catch (cleanupError) {
        console.warn('Error cleaning up temporary files')
      }
    }
  } catch (error) {
    console.error('Error during database restore:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  // This script is being run directly
  main().catch((error) => {
    console.error('Unhandled error:', error)
    process.exit(1)
  })
}

export default main
