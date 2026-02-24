import { spawn } from 'child_process'
import fs, {
  createReadStream,
  createWriteStream,
  promises as fsPromises
} from 'fs'
import { join } from 'path'
import { createInterface } from 'readline'
import { Readable } from 'stream'
import { pipeline } from 'stream/promises'
import { TransformStream } from 'stream/web'
import { createGunzip } from 'zlib'

import { PrismaClient } from '.prisma/api-media-client'

const prisma = new PrismaClient()

// Constants
const GZIPPED_BACKUP_FILE_NAME = 'media-backup.sql.gz'
const BACKUP_FILE_NAME = 'media-backup.sql'
const PROCESSED_BACKUP_FILE_NAME = 'media-backup-processed.sql'
const CLOUDFLARE_IMAGES_FILE_NAME = 'cloudflareImage-system-data.sql.gz'
const CLOUDFLARE_IMAGES_SQL_FILE_NAME = 'cloudflareImage-system-data.sql'
const PROCESSED_CLOUDFLARE_IMAGES_SQL_FILE_NAME =
  'cloudflareImage-system-data-processed.sql'

/**
 * Downloads a file from a URL and saves it locally
 */
async function downloadFile(url: string, outputPath: string): Promise<void> {
  console.log(`Downloading file from ${url}`)
  const startTime = Date.now()
  const fileName = outputPath.split('/').pop() || outputPath

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

    // Get the total size for progress reporting
    const contentLength = response.headers.get('content-length')
    const totalBytes = contentLength ? parseInt(contentLength, 10) : 0

    let downloadedBytes = 0
    const lastProgressUpdate = 0

    const progressInterval = setInterval(() => {
      if (totalBytes) {
        const percent = Math.round((downloadedBytes / totalBytes) * 100)
        console.log(
          `Downloading ${fileName}: ${percent}% (${(downloadedBytes / 1024 / 1024).toFixed(2)} MB of ${(totalBytes / 1024 / 1024).toFixed(2)} MB)`
        )
      } else {
        console.log(
          `Downloading ${fileName}: ${(downloadedBytes / 1024 / 1024).toFixed(2)} MB`
        )
      }
    }, 2000)

    // Create a transform stream to track progress
    const progressStream = new TransformStream({
      transform(chunk, controller) {
        downloadedBytes += chunk.length
        controller.enqueue(chunk)
      }
    })

    const fileStream = fs.createWriteStream(outputPath)

    // Use the web streams API with progress tracking
    await pipeline(
      Readable.fromWeb((response.body as any).pipeThrough(progressStream)),
      fileStream
    )

    clearInterval(progressInterval)

    // Verify the file was downloaded and has content
    const stats = await fsPromises.stat(outputPath)
    if (stats.size === 0) {
      throw new Error('Downloaded file is empty')
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(
      `Download completed: ${fileName} (${(stats.size / 1024 / 1024).toFixed(2)} MB in ${duration}s)`
    )
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
  const startTime = Date.now()
  const fileName = outputFile.split('/').pop() || outputFile
  console.log(`Decompressing to ${fileName}`)

  try {
    // Verify the input file exists and get its size
    const stats = await fsPromises.stat(inputFile)
    const inputSize = stats.size
    console.log(
      `Decompressing ${(inputSize / 1024 / 1024).toFixed(2)} MB file...`
    )

    const source = fs.createReadStream(inputFile)
    const gunzip = createGunzip()
    const destination = fs.createWriteStream(outputFile)

    let processedBytes = 0
    const progressInterval = setInterval(() => {
      console.log(
        `Decompression in progress: ${(processedBytes / 1024 / 1024).toFixed(2)} MB processed`
      )
    }, 2000)

    // Track decompression progress
    source.on('data', (chunk) => {
      processedBytes += chunk.length
    })

    await pipeline(source, gunzip, destination)
    clearInterval(progressInterval)

    // Verify the output file exists and has content
    const outputStats = await fsPromises.stat(outputFile)
    if (outputStats.size === 0) {
      throw new Error('Decompressed file is empty')
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1)
    const ratio = (outputStats.size / inputSize).toFixed(1)
    console.log(
      `Decompression completed: ${fileName} (${(outputStats.size / 1024 / 1024).toFixed(2)} MB, ratio ${ratio}x, took ${duration}s)`
    )
  } catch (error) {
    console.error('Error decompressing file:', error)
    throw error
  }
}

/**
 * Preprocesses the SQL file to ensure compatibility with existing database
 * Uses streaming to handle large files without loading them entirely into memory
 */
async function preprocessSqlFile(
  inputFile: string,
  outputFile: string
): Promise<void> {
  console.log('Preprocessing SQL file for compatibility')

  try {
    // Get file size for progress reporting
    const stats = await fsPromises.stat(inputFile)
    const totalSize = stats.size
    const fileName = inputFile.split('/').pop() || inputFile
    console.log(
      `Processing ${fileName} (${(totalSize / 1024 / 1024).toFixed(2)} MB)`
    )

    const startTime = Date.now()
    let processedBytes = 0
    let linesProcessed = 0
    let publicationStatementsRemoved = 0
    let psqlMetaCommandsRemoved = 0

    // Create read and write streams
    const readStream = createReadStream(inputFile)
    const writeStream = createWriteStream(outputFile)

    // Create readline interface for line-by-line processing
    const rl = createInterface({
      input: readStream,
      crlfDelay: Infinity // Handle Windows line endings
    })

    // Progress reporting
    const progressInterval = setInterval(() => {
      const percent =
        totalSize > 0 ? Math.round((processedBytes / totalSize) * 100) : 0
      console.log(
        `Processing: ${percent}% (${linesProcessed.toLocaleString()} lines, ${publicationStatementsRemoved} publication statements removed)`
      )
    }, 3000)

    // Process each line
    for await (const line of rl) {
      linesProcessed++
      processedBytes += Buffer.byteLength(line, 'utf8') + 1 // +1 for newline

      // Check if this line contains a CREATE PUBLICATION statement
      if (/CREATE PUBLICATION .* FOR .*;/.test(line)) {
        publicationStatementsRemoved++
        // Skip this line (don't write it to output)
        continue
      }

      // Remove non-essential psql meta-commands (lines starting with a backslash), keep COPY terminator (\.) and \copy commands
      if (
        /^\s*\\/.test(line) &&
        !/^\s*\\\.$/.test(line) &&
        !/^\s*\\copy\b/i.test(line)
      ) {
        psqlMetaCommandsRemoved++
        continue
      }

      // Write the line to output file
      writeStream.write(line + '\n')
    }

    // Close the write stream
    writeStream.end()

    // Wait for the write stream to finish
    await new Promise<void>((resolve, reject) => {
      writeStream.on('finish', resolve)
      writeStream.on('error', reject)
    })

    clearInterval(progressInterval)

    // Verify the output file exists and has content
    const outputStats = await fsPromises.stat(outputFile)
    if (outputStats.size === 0) {
      throw new Error('Processed file is empty')
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(
      `SQL file preprocessing completed: ${fileName} -> ${(outputStats.size / 1024 / 1024).toFixed(2)} MB (${linesProcessed.toLocaleString()} lines processed, ${publicationStatementsRemoved} publication statements removed, ${psqlMetaCommandsRemoved} psql meta-commands removed, took ${duration}s)`
    )
  } catch (error) {
    console.error('Error preprocessing SQL file:', error)
    throw error
  }
}

/**
 * Executes psql command to restore a database from SQL file
 */
async function executePsql(
  filePath: string,
  options: { noReset?: boolean } = {}
): Promise<void> {
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
        .then(async () => {
          const databaseUrl = new URL(process.env.PG_DATABASE_URL_MEDIA ?? '')
          const host = databaseUrl.hostname
          const port = databaseUrl.port
          const database = databaseUrl.pathname.slice(1)
          const username = databaseUrl.username

          // Get file size for progress reporting
          const stats = await fsPromises.stat(filePath)
          const totalSize = stats.size
          const fileName = filePath.split('/').pop() || filePath

          console.log(
            `Starting import of ${fileName} (${(totalSize / 1024 / 1024).toFixed(2)} MB)`
          )

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
            '--single-transaction'
          ]

          // Only include the schema reset for the main database backup
          if (!options.noReset) {
            args.push('-c', 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;')
          }

          args.push('-f', filePath)

          console.log(`Starting database restore with psql on ${database}`)
          const startTime = Date.now()
          const psql = spawn('psql', args, { env })

          // Set up progress tracking
          let lastProgressTime = Date.now()
          const progressInterval = setInterval(() => {
            const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(0)
            console.log(`Import in progress... (${elapsedSeconds}s elapsed)`)
          }, 5000) // Update every 5 seconds

          // Collect stderr for error reporting and progress tracking
          let stderrData = ''
          psql.stderr.on('data', (data) => {
            const chunk = data.toString()
            stderrData += chunk

            // Update the last activity time whenever we get output
            lastProgressTime = Date.now()

            // Only log actual errors, not progress messages
            if (chunk.toLowerCase().includes('error')) {
              console.error(`Error during import: ${chunk}`)
            }
          })

          // Also monitor stdout for progress indication
          psql.stdout.on('data', (data) => {
            lastProgressTime = Date.now()
          })

          psql.on('close', (code) => {
            clearInterval(progressInterval)

            const duration = ((Date.now() - startTime) / 1000).toFixed(1)
            if (code === 0) {
              console.log(
                `Database restore completed successfully: ${fileName} (took ${duration}s)`
              )
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
            clearInterval(progressInterval)
            console.error('Error spawning psql process:', error)
            reject(error instanceof Error ? error : new Error(String(error)))
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
  const files: Record<string, string | null> = {
    mainGzipped: null,
    mainSql: null,
    processedMainSql: null,
    cloudflareGzipped: null,
    cloudflareSql: null,
    processedCloudflareSql: null
  }

  try {
    console.log('Starting data import script')

    // Check required environment variables
    if (!process.env.DB_SEED_PATH) {
      throw new Error('DB_SEED_PATH environment variable is not set')
    }
    if (!process.env.PG_DATABASE_URL_MEDIA) {
      throw new Error('PG_DATABASE_URL_MEDIA environment variable is not set')
    }

    const baseUrl = process.env.DB_SEED_PATH
    // Ensure the base URL ends with a slash if not already
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
    const mainBackupUrl = `${normalizedBaseUrl}${GZIPPED_BACKUP_FILE_NAME}`
    const cloudflareImagesUrl = `${normalizedBaseUrl}${CLOUDFLARE_IMAGES_FILE_NAME}`

    try {
      const tempDir = join(process.cwd(), 'imports')
      await fsPromises.mkdir(tempDir, { recursive: true })

      // Step 1: Download both files
      console.log('Step 1: Downloading backup files')

      // Download main backup
      files.mainGzipped = join(tempDir, GZIPPED_BACKUP_FILE_NAME)
      await downloadFile(mainBackupUrl, files.mainGzipped)

      // Download CloudflareImage data
      files.cloudflareGzipped = join(tempDir, CLOUDFLARE_IMAGES_FILE_NAME)
      try {
        await downloadFile(cloudflareImagesUrl, files.cloudflareGzipped)
      } catch (error) {
        const typedError =
          error instanceof Error ? error : new Error(String(error))
        console.warn(`CloudflareImage data not found: ${typedError.message}`)
        console.warn('Will continue with main import only')
        files.cloudflareGzipped = null
      }

      // Step 2: Decompress files
      console.log('Step 2: Decompressing files')

      // Decompress main backup
      files.mainSql = join(tempDir, BACKUP_FILE_NAME)
      await decompressFile(files.mainGzipped, files.mainSql)

      // Decompress CloudflareImage data if available
      if (files.cloudflareGzipped) {
        files.cloudflareSql = join(tempDir, CLOUDFLARE_IMAGES_SQL_FILE_NAME)
        try {
          await decompressFile(files.cloudflareGzipped, files.cloudflareSql)
        } catch (error) {
          const typedError =
            error instanceof Error ? error : new Error(String(error))
          console.warn(
            `Failed to decompress CloudflareImage data: ${typedError.message}`
          )
          files.cloudflareSql = null
        }
      }

      // Step 2.5: Preprocess SQL files to remove publications
      console.log('Step 2.5: Preprocessing SQL files')

      // Preprocess main backup
      files.processedMainSql = join(tempDir, PROCESSED_BACKUP_FILE_NAME)
      await preprocessSqlFile(files.mainSql, files.processedMainSql)

      // Preprocess CloudflareImage data if available
      if (files.cloudflareSql) {
        files.processedCloudflareSql = join(
          tempDir,
          PROCESSED_CLOUDFLARE_IMAGES_SQL_FILE_NAME
        )
        try {
          await preprocessSqlFile(
            files.cloudflareSql,
            files.processedCloudflareSql
          )
        } catch (error) {
          const typedError =
            error instanceof Error ? error : new Error(String(error))
          console.warn(
            `Failed to preprocess CloudflareImage data: ${typedError.message}`
          )
          files.processedCloudflareSql = null
        }
      }

      // Step 3: Import SQL files
      console.log('Step 3: Importing data')

      // Import main backup (with schema reset)
      await executePsql(files.processedMainSql)

      // Import CloudflareImage data if available (without schema reset)
      if (files.processedCloudflareSql) {
        try {
          await executePsql(files.processedCloudflareSql, { noReset: true })
        } catch (error) {
          const typedError =
            error instanceof Error ? error : new Error(String(error))
          console.warn(
            `Failed to import CloudflareImage data: ${typedError.message}`
          )
        }
      }

      // Step 4: Update import time in database
      console.log('Step 4: Updating import timestamp')
      await prisma.importTimes.upsert({
        where: { modelName: 'dataImport' },
        update: { lastImport: new Date() },
        create: { modelName: 'dataImport', lastImport: new Date() }
      })

      console.log('Data import completed successfully')
      process.exit(0)
    } finally {
      // Clean up temporary files
      console.log('Cleaning up temporary files')
      const filesToDelete = Object.values(files).filter(Boolean) as string[]

      for (const file of filesToDelete) {
        try {
          await fsPromises.unlink(file)
        } catch (error) {
          console.warn(`Failed to delete temp file: ${file}`)
        }
      }
    }
  } catch (error) {
    const typedError = error instanceof Error ? error : new Error(String(error))
    console.error('Error during data import:', typedError)
    process.exit(1)
  }
}

if (require.main === module) {
  // This script is being run directly
  main().catch((error) => {
    const typedError = error instanceof Error ? error : new Error(String(error))
    console.error('Unhandled error:', typedError)
    process.exit(1)
  })
}

export default main
export { preprocessSqlFile }
