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
    let rowsRes
    let pageToken

    const query = `SELECT * FROM ${table}`
    // create a query job in BQ
    const [job] = await bigquery.createQueryJob({ query })
    return {
      async next() {
        try {
          // poll query job in BQ
          const res = await job.getQueryResults({ maxResults: 500, pageToken })
          rowsRes = res[0]
          pageToken = res[1]?.pageToken
        } catch (e) {
          throw new Error(e.message)
        }
        return {
          done: pageToken == null,
          value: rowsRes
        }
      }
    }
  }
}
