import { spawn } from 'child_process'
import { createWriteStream, promises as fs } from 'fs'
import { join } from 'path'
import { pipeline } from 'stream/promises'
import { createGzip } from 'zlib'

import { Logger } from 'pino'

import { prisma } from '../../../lib/prisma'
import { logger as baseLogger } from '../../../logger'

// Define the models to export based on the Prisma schema
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
 * Creates a tar.gz archive from a directory
 * @param sourceDir Directory to archive
 * @param outputFile Output tar.gz file
 * @param logger Logger instance
 */
async function createTarGz(
  sourceDir: string,
  outputFile: string,
  logger: Logger
): Promise<void> {
  return new Promise((resolve, reject) => {
    logger.info(`Creating tar.gz archive: ${outputFile}`)

    // Use tar command to create archive
    // -c: create archive, -z: gzip, -f: file, -C: change to directory
    const tar = spawn('tar', ['-czf', outputFile, '-C', sourceDir, '.'])

    tar.stdout.on('data', (data) => {
      logger.debug(`tar stdout: ${data}`)
    })

    tar.stderr.on('data', (data) => {
      logger.debug(`tar stderr: ${data}`)
    })

    tar.on('close', (code) => {
      if (code === 0) {
        logger.info(`Archive created successfully: ${outputFile}`)
        resolve()
      } else {
        const error = new Error(`tar process exited with code ${code}`)
        logger.error({ error }, 'Failed to create archive')
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
 * Exports all data from the database to JSON files and compresses them into a tar.gz archive
 */
export const service = async (customLogger?: Logger): Promise<void> => {
  const logger = customLogger ?? baseLogger.child({ worker: 'dataExport' })

  try {
    logger.info('Starting data export')

    // Create a temporary directory for JSON files
    const tempDir = join(process.cwd(), 'temp_export')
    await fs.mkdir(tempDir, { recursive: true })

    // Export each model to a JSON file
    for (const model of models) {
      logger.info(`Exporting ${model.name}`)

      // @ts-expect-error - Dynamic access to prisma client
      const data = await prisma[model.prismaName].findMany()

      const jsonPath = join(tempDir, `${model.name}.json`)
      await fs.writeFile(jsonPath, JSON.stringify(data, null, 2))

      logger.info(`Exported ${data.length} ${model.name} records`)
    }

    // Create a manifest file with metadata
    const manifest = {
      exportDate: new Date().toISOString(),
      models: models.map((m) => m.name),
      version: '1.0.0'
    }

    await fs.writeFile(
      join(tempDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    )

    // Create output directory
    const outputDir = join(process.cwd(), 'exports')
    await fs.mkdir(outputDir, { recursive: true })

    // Create timestamp for filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const outputFile = join(outputDir, `languages-export-${timestamp}.tar.gz`)

    // Create tar.gz archive
    await createTarGz(tempDir, outputFile, logger)

    // Clean up temporary files
    await fs.rm(tempDir, { recursive: true, force: true })

    logger.info(
      `Data export completed successfully. Output file: ${outputFile}`
    )

    return
  } catch (error) {
    logger.error({ error }, 'Error during data export')
    throw error
  }
}
