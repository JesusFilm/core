import { spawn } from 'child_process'
import { promises as fs } from 'fs'
import { join } from 'path'

import { Logger } from 'pino'

import { prisma } from '../../../lib/prisma'
import { logger as baseLogger } from '../../../logger'

/**
 * Executes pg_dump to create a database backup
 * @param outputFile Path to the output file
 * @param logger Logger instance
 */
async function executePgDump(
  outputFile: string,
  logger: Logger
): Promise<void> {
  return new Promise((resolve, reject) => {
    logger.info(`Creating database backup: ${outputFile}`)

    // Get database connection details from environment variables
    const dbUrl = process.env.PG_DATABASE_URL_LANGUAGES

    if (!dbUrl) {
      const error = new Error(
        'PG_DATABASE_URL_LANGUAGES environment variable is not set'
      )
      logger.error({ error }, 'Missing database URL')
      return reject(error)
    }

    // Parse database URL to extract connection details
    const dbUrlObj = new URL(dbUrl)
    const host = dbUrlObj.hostname
    const port = dbUrlObj.port || '5432'
    const database = dbUrlObj.pathname.substring(1) // Remove leading slash
    const username = dbUrlObj.username
    const password = dbUrlObj.password

    // Log connection details (without password)
    logger.info(
      {
        host,
        port,
        database,
        username
      },
      'Database connection details'
    )

    // Set environment variables for pg_dump
    const env = {
      ...process.env,
      PGPASSWORD: password
    }

    // Execute pg_dump command
    // -F c: custom format (compressed)
    // -Z 9: maximum compression level
    // -v: verbose
    const pgDumpArgs = [
      '-h',
      host,
      '-p',
      port,
      '-U',
      username,
      '-d',
      database,
      // Add specific tables that we know should be included
      // This ensures we capture the Prisma models
      '--table=public.Language',
      '--table=public.LanguageName',
      '--table=public.Country',
      '--table=public.CountryLanguage',
      '--table=public.CountryName',
      '--table=public.Continent',
      '--table=public.ContinentName',
      '--table=public.AudioPreview',
      '--table=public.ImportTimes',
      '-F',
      'c',
      '-Z',
      '9',
      '-v',
      // Uncomment the next line to export only data (for troubleshooting)
      // '--data-only',
      '-f',
      outputFile
    ]

    logger.info(
      { command: 'pg_dump', args: pgDumpArgs.join(' ') },
      'Executing pg_dump command'
    )

    const pgDump = spawn('pg_dump', pgDumpArgs, { env })

    let stdoutData = ''
    let stderrData = ''

    pgDump.stdout.on('data', (data) => {
      const dataStr = data.toString()
      stdoutData += dataStr
      logger.debug(`pg_dump stdout: ${dataStr}`)
    })

    pgDump.stderr.on('data', (data) => {
      // pg_dump sends progress info to stderr
      const dataStr = data.toString()
      stderrData += dataStr
      logger.debug(`pg_dump stderr: ${dataStr}`)
    })

    pgDump.on('close', (code) => {
      if (code === 0) {
        // Check if the file was created and get its size
        fs.stat(outputFile)
          .then((stats) => {
            logger.info(
              {
                fileSize: `${(stats.size / (1024 * 1024)).toFixed(2)} MB`,
                outputFile
              },
              `Database backup created successfully`
            )

            // Log a summary of stderr output which contains table info
            logger.info(
              {
                stderrSummary: stderrData
                  .split('\n')
                  .filter(
                    (line) =>
                      line.includes('Dumping') || line.includes('Dumped')
                  )
                  .join('\n')
              },
              'Export summary'
            )

            resolve()
          })
          .catch((statError: Error) => {
            logger.error(
              { error: statError },
              `File stats error: ${statError.message}`
            )
            reject(new Error(`Failed to get file stats: ${statError.message}`))
          })
      } else {
        const error = new Error(`pg_dump process exited with code ${code}`)
        logger.error(
          {
            error,
            stderr: stderrData,
            stdout: stdoutData,
            exitCode: code
          },
          'Failed to create database backup'
        )
        reject(error)
      }
    })

    pgDump.on('error', (error) => {
      logger.error(
        {
          error,
          stderr: stderrData,
          stdout: stdoutData
        },
        'Error spawning pg_dump process'
      )
      reject(error)
    })
  })
}

/**
 * Exports database using pg_dump
 */
export const service = async (customLogger?: Logger): Promise<void> => {
  const logger = customLogger ?? baseLogger.child({ worker: 'dataExport' })

  try {
    logger.info('Starting database export')

    // Verify that there's data in the database before export
    try {
      const languageCount = await prisma.language.count()
      const countryCount = await prisma.country.count()
      const continentCount = await prisma.continent.count()

      logger.info(
        {
          languageCount,
          countryCount,
          continentCount
        },
        'Database content verification before export'
      )

      if (languageCount === 0 && countryCount === 0 && continentCount === 0) {
        logger.warn('No data found in the database. The export will be empty.')

        // Try a direct SQL query to check if there's any data in any tables
        try {
          // Query all tables in all schemas (excluding system schemas)
          const tables = await prisma.$queryRaw`
            SELECT table_name, table_schema 
            FROM information_schema.tables 
            WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
            AND table_type = 'BASE TABLE'
          `

          logger.info({ tables }, 'Tables in the database')

          // Check if any tables have data
          for (const table of Array.isArray(tables) ? tables : []) {
            if (table.table_name && table.table_schema) {
              const schema = table.table_schema
              const tableName = table.table_name

              const countQuery = `
                SELECT COUNT(*) as count 
                FROM "${schema}"."${tableName}"
              `
              try {
                const countResult = await prisma.$queryRawUnsafe(countQuery)
                const count =
                  Array.isArray(countResult) && countResult.length > 0
                    ? Number(countResult[0]?.count || 0)
                    : 0

                if (count > 0) {
                  logger.info(
                    { schema, table: tableName, count },
                    'Found data in table'
                  )
                }
              } catch (countError) {
                logger.debug(
                  { error: countError, schema, table: tableName },
                  'Error counting table rows'
                )
              }
            }
          }
        } catch (sqlError) {
          logger.error(
            { error: sqlError },
            'Error executing SQL verification queries'
          )
        }
      }
    } catch (verifyError) {
      logger.error({ error: verifyError }, 'Error verifying database content')
    }

    // Create output directory
    const outputDir = join(process.cwd(), 'exports')
    await fs.mkdir(outputDir, { recursive: true })

    // Create timestamp for filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const outputFile = join(outputDir, `languages-export-${timestamp}.pgdump`)

    // Execute pg_dump
    await executePgDump(outputFile, logger)

    logger.info(
      `Database export completed successfully. Output file: ${outputFile}`
    )

    return
  } catch (error) {
    logger.error({ error }, 'Error during database export')
    throw error
  }
}
