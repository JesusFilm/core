import { BigQuery, RowMetadata } from '@google-cloud/bigquery'
import { Injectable } from '@nestjs/common'

const bqClient = new BigQuery({
  credentials: {
    type: 'service_account',
    project_id: process.env.BIG_QUERY_PROJECT_ID,
    private_key:
      process.env.BIG_QUERY_PRIVATE_KEY != null
        ? process.env.BIG_QUERY_PRIVATE_KEY.split(String.raw`\n`).join('\n')
        : '',
    client_email: process.env.BIG_QUERY_CLIENT_EMAIL
  },
  projectId: process.env.BIG_QUERY_PROJECT_ID
})

@Injectable()
export class BigQueryService {
  async bigQueryRowIterator(table: string): Promise<{
    next: () => Promise<{
      done: boolean
      value: RowMetadata
    }>
  }> {
    const maxResults = 500
    let rowRes
    let pageToken: string | undefined
    let results: unknown[] = []
    let jobRes
    const query = `SELECT * FROM \`${table}\``
    try {
      const [job] = await bqClient.createQueryJob({ query })
      jobRes = job
      const res = await jobRes.getQueryResults({ maxResults, pageToken })
      results = res[0]
      pageToken = res[1]?.pageToken
    } catch (e) {
      console.log('failed to fetch from big query: ', e)
    }

    return {
      async next() {
        if (results.length === 0) {
          try {
            const res = await jobRes.getQueryResults({ maxResults, pageToken })
            results = res[0]
            pageToken = res[1]?.pageToken
          } catch (e) {
            console.log('failed to fetch from big query: ', e)
          }
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
