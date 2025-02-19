import { BigQuery, Job, RowMetadata } from '@google-cloud/bigquery'
import get from 'lodash/get'
import { Logger } from 'pino'
import { ZodSchema, z } from 'zod'

import { prisma } from '../../lib/prisma'

let logger: Logger | undefined

export interface BigQueryRowError {
  bigQueryTableName: string
  id: string
  message: string
}

interface QueryResults {
  data: RowMetadata[]
  pageToken?: string
}

export const client = new BigQuery({
  credentials:
    process.env.BIG_QUERY_APPLICATION_JSON != null
      ? JSON.parse(process.env.BIG_QUERY_APPLICATION_JSON)
      : undefined
})

export async function createQueryJob(
  table: string,
  lastImport: Date | undefined,
  hasUpdatedAt: boolean
): Promise<Job> {
  try {
    const query = `SELECT * FROM \`${table}\` ${
      hasUpdatedAt && lastImport !== undefined
        ? 'WHERE updatedAt > @updatedAt'
        : ''
    }`

    const params = {
      updatedAt: lastImport
    }
    const [job] = await client.createQueryJob({
      query,
      params,
      location: 'US'
    })

    return job
  } catch (e) {
    if (e instanceof Error)
      throw new Error(`failed to create job in BigQuery: ${e.message}`)
    throw new Error('unknown error creating job in BigQuery')
  }
}

export async function* getRowsFromTable(
  table: string,
  lastImport: Date | undefined,
  hasUpdatedAt: boolean,
  singleRow = true
): AsyncGenerator<RowMetadata | RowMetadata[], void, unknown> {
  const job = await createQueryJob(table, lastImport, hasUpdatedAt)
  let results: QueryResults = { data: [] }
  do {
    if (results.data.length === 0)
      results = await getQueryResults(job, results.pageToken)
    if (results.data.length > 0) {
      if (singleRow) {
        yield results.data.shift()
      } else {
        yield results.data
        results.data = []
      }
    }
  } while (results.data.length > 0 || results.pageToken != null)
}

async function getQueryResults(
  job: Job,
  pageToken?: string
): Promise<QueryResults> {
  try {
    const res = await job.getQueryResults({
      maxResults: 10_000,
      pageToken
    })
    return {
      data: res[0],
      pageToken: res[1]?.pageToken
    }
  } catch (e) {
    if (e instanceof Error)
      throw new Error(`failed to create job in BigQuery: ${e.message}`)
    throw new Error('unknown error creating job in BigQuery')
  }
}

export async function getCurrentTimeStamp(): Promise<string> {
  const [result] = await client.query('SELECT CURRENT_TIMESTAMP()')
  return result[0].f0_.value
}

export function parse<T extends ZodSchema>(
  schema: T,
  row: unknown
): z.infer<T> {
  const parser = schema.safeParse(row)
  if (!parser.success) {
    throw new Error(
      `row does not match schema: ${
        get(row, 'id') ?? 'unknownId'
      }\n${JSON.stringify(row, null, 2)}`
    )
  }
  return parser.data
}

export function parseMany<T extends ZodSchema>(
  schema: T,
  rows: unknown[]
): { data: Array<z.infer<T>>; inValidRowIds: string[] } {
  const validRows: T[] = []
  const inValidRowIds: string[] = []
  for (const row of rows) {
    const data = schema.safeParse(row)
    if (data.success) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      validRows.push(data.data)
    } else {
      logger?.error(data.error)
      inValidRowIds.push(get(row, 'id') ?? 'unknownId')
    }
  }
  return { data: validRows, inValidRowIds }
}

export async function processTable(
  bigQueryTableName: string,
  importOne: (row: unknown) => Promise<void>,
  importMany: (rows: unknown[]) => Promise<void>,
  hasUpdatedAt: boolean,
  parentLogger?: Logger
): Promise<void> {
  logger = parentLogger?.child({
    table: bigQueryTableName
      .split('.')
      .at(-1)
      ?.replace('core_', '')
      .replace('_arclight_data', '')
  })
  logger?.info('table import started')
  const errors: BigQueryRowError[] = []
  const importTime = await prisma.importTimes.findUnique({
    where: { modelName: bigQueryTableName }
  })
  const updateTime = await getCurrentTimeStamp()
  if (importTime != null || !hasUpdatedAt) {
    for await (const row of getRowsFromTable(
      bigQueryTableName,
      importTime?.lastImport,
      hasUpdatedAt
    )) {
      try {
        await importOne(row)
      } catch (error) {
        if (error instanceof Error) {
          errors.push({
            bigQueryTableName,
            id: get(row, 'id') ?? get(row, 'videoId'),
            message: error.message
          })
        }
      }
    }
  } else {
    let page = 0
    for await (const rows of getRowsFromTable(
      bigQueryTableName,
      undefined,
      hasUpdatedAt,
      false
    )) {
      try {
        page++
        logger?.info({ page, rows: rows.length }, 'importing page')
        await importMany(rows as unknown[])
      } catch (error) {
        logger?.error(error)
      }
    }
  }
  await prisma.importTimes.upsert({
    where: { modelName: bigQueryTableName },
    create: {
      modelName: bigQueryTableName,
      lastImport: updateTime
    },
    update: { lastImport: updateTime }
  })

  if (errors.length > 0) {
    logger?.error({ errors }, 'table import finished with errors')
  } else {
    logger?.info('table import finished')
  }
}
