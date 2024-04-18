import { BigQuery, QueryRowsResponse } from '@google-cloud/bigquery'
import { Injectable } from '@nestjs/common'

const bigquery = new BigQuery({
  credentials: {
    type: 'service_account',
    project_id: process.env.BIG_QUERY_PROJECT_ID,
    private_key: process.env.BIG_QUERY_PRIVATE_KEY,
    client_email: process.env.BIG_QUERY_CLIENT_EMAIL
  },
  projectId: process.env.BIG_QUERY_PROJECT_ID
})

@Injectable()
export class BigQueryService {
  async getBigQueryDataFromTableIterator(table: string): Promise<{
    next: () => Promise<{
      done: boolean
      value: QueryRowsResponse
    }>
  }> {
    const maxResults = 500

    let rowRes
    let pageToken: string | undefined
    let results: unknown[] = []

    const query = `SELECT * FROM ${table}`

    const [job] = await bigquery.createQueryJob({ query })
    const res = await job.getQueryResults({ maxResults, pageToken })
    results = res[0]
    pageToken = res[1]?.pageToken

    return {
      async next() {
        if (results.length === 0) {
          const res = await job.getQueryResults({ maxResults, pageToken })
          results = res[0]
          pageToken = res[1]?.pageToken
        }
        rowRes = results.shift()
        return {
          done: pageToken == null && results.length === 0,
          value: rowRes
        }
      }
    }
  }
}
