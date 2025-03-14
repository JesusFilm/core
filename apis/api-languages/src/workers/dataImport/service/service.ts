import { spawn } from 'child_process'
import { createReadStream, promises as fs } from 'fs'
import { join } from 'path'
import { pipeline } from 'stream/promises'
import { createGunzip } from 'zlib'

import { Logger } from 'pino'

import { prisma } from '../../../lib/prisma'
import { logger as baseLogger } from '../../../logger'

// Define the models to import based on the Prisma schema
const models = [
  { name: 'Language', prismaName: 'language' },
  { name: 'LanguageName', prismaName: 'languageName' },
  { name: 'Country', prismaName: 'country' },
  { name: 'CountryLanguage', prismaName: 'countryLanguage' },
  { name: 'CountryName', prismaName: 'countryName' },
  { name: 'Continent', prismaName: 'continent' },
  { name: 'ContinentName', prismaName: 'continentName' },
  { name: 'AudioPreview', prismaName: 'audioPreview' },
  { name: 'ImportTimes', prismaName: 'importTimes' }
]

/**
 * Extracts a tar.gz archive to a directory
 * @param archiveFile Path to the tar.gz archive
 * @param outputDir Directory to extract to
 * @param logger Logger instance
 */
async function extractTarGz(
  archiveFile: string,
  outputDir: string,
  logger: Logger
): Promise<void> {
  return new Promise((resolve, reject) => {
    logger.info(`Extracting archive: ${archiveFile} to ${outputDir}`)

    // Use tar command to extract archive
    // -x: extract, -z: gzip, -f: file, -C: change to directory
    const tar = spawn('tar', ['-xzf', archiveFile, '-C', outputDir])

    tar.stdout.on('data', (data) => {
      logger.debug(`tar stdout: ${data}`)
    })

    tar.stderr.on('data', (data) => {
      logger.debug(`tar stderr: ${data}`)
    })

    tar.on('close', (code) => {
      if (code === 0) {
        logger.info(`Archive extracted successfully to: ${outputDir}`)
        resolve()
      } else {
        const error = new Error(`tar process exited with code ${code}`)
        logger.error({ error }, 'Failed to extract archive')
        reject(error)
      }
    })

    tar.on('error', (error) => {
      logger.error({ error }, 'Error spawning tar process')
      reject(error)
    })
  })
}

/**
 * Imports data from a tar.gz archive containing JSON files into the database
 * @param filePath Path to the tar.gz archive
 * @param options Import options
 * @param customLogger Optional custom logger
 */
export const service = async (
  filePath: string,
  options: {
    clearExistingData?: boolean
    importModels?: string[]
  } = {},
  customLogger?: Logger
): Promise<void> => {
  const logger = customLogger ?? baseLogger.child({ worker: 'dataImport' })
  const { clearExistingData = false, importModels } = options

  try {
    logger.info({ filePath }, 'Starting data import')

    if (!(await fs.stat(filePath).catch(() => false))) {
      throw new Error(`File not found: ${filePath}`)
    }

    // Create a temporary directory for extracted files
    const tempDir = join(process.cwd(), 'temp_import')
    await fs.mkdir(tempDir, { recursive: true })

    // Extract the archive
    logger.info('Extracting archive')
    await extractTarGz(filePath, tempDir, logger)

    // Read the manifest file
    logger.info('Reading manifest')
    const manifestPath = join(tempDir, 'manifest.json')
    const manifestContent = await fs.readFile(manifestPath, 'utf-8')
    const manifest = JSON.parse(manifestContent)

    if (!manifest) {
      throw new Error('Invalid data format: missing manifest')
    }

    logger.info(
      {
        exportDate: manifest.exportDate,
        version: manifest.version,
        models: manifest.models
      },
      'Found manifest'
    )

    // Filter models to import if specified
    const modelsToImport = importModels
      ? models.filter((m) => importModels.includes(m.name))
      : models

    // Clear existing data if requested
    if (clearExistingData) {
      logger.info('Clearing existing data')

      // Delete in reverse order to respect foreign key constraints
      for (const model of [...modelsToImport].reverse()) {
        logger.info(`Clearing ${model.name}`)
        // @ts-expect-error - Dynamic access to prisma client
        await prisma[model.prismaName].deleteMany({})
      }
    }

    // Import data for each model
    for (const model of modelsToImport) {
      const modelFilePath = join(tempDir, `${model.name}.json`)

      // Check if the file exists
      if (!(await fs.stat(modelFilePath).catch(() => false))) {
        logger.warn(`File not found for ${model.name}, skipping`)
        continue
      }

      // Read and parse the model data
      const modelContent = await fs.readFile(modelFilePath, 'utf-8')
      const modelData = JSON.parse(modelContent)

      if (!Array.isArray(modelData)) {
        logger.warn(`Invalid data format for ${model.name}, skipping`)
        continue
      }

      logger.info(`Importing ${modelData.length} ${model.name} records`)

      // Import in batches to avoid overwhelming the database
      const BATCH_SIZE = 100
      for (let i = 0; i < modelData.length; i += BATCH_SIZE) {
        const batch = modelData.slice(i, i + BATCH_SIZE)

        try {
          // @ts-expect-error - Dynamic access to prisma client
          await prisma[model.prismaName].createMany({
            data: batch,
            skipDuplicates: true
          })
        } catch (error) {
          logger.error(
            { error, model: model.name, batchIndex: i },
            'Error importing batch'
          )

          // Fall back to individual inserts if batch fails
          logger.info('Falling back to individual inserts')
          for (const record of batch) {
            try {
              // @ts-expect-error - Dynamic access to prisma client
              await prisma[model.prismaName].create({
                data: record
              })
            } catch (recordError) {
              logger.error(
                { error: recordError, model: model.name, record },
                'Error importing individual record'
              )
            }
          }
        }
      }

      logger.info(`Completed import for ${model.name}`)
    }

    // Clean up temporary files
    await fs.rm(tempDir, { recursive: true, force: true })

    // Update import times
    await prisma.importTimes.upsert({
      where: { modelName: 'dataImport' },
      update: { lastImport: new Date() },
      create: { modelName: 'dataImport', lastImport: new Date() }
    })

    logger.info('Data import completed successfully')
    return
  } catch (error) {
    logger.error({ error }, 'Error during data import')
    throw error
  }
}
