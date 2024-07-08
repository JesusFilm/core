import { BigQuery, Job, RowMetadata } from '@google-cloud/bigquery'

interface QueryResults {
  data: RowMetadata[]
  pageToken?: string
}

const client = new BigQuery({
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
    if (singleRow) {
      yield results.data.shift()
    } else {
      yield results.data
      results.data = []
    }
  } while (results.data.length > 0 || results.pageToken != null)
}

async function getQueryResults(
  job: Job,
  pageToken?: string
): Promise<QueryResults> {
  try {
    const res = await job.getQueryResults({
      maxResults: 5000,
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
  console.log('result', result)
  return result[0].f0_.value
}
