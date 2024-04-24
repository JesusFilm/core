import { BigQuery, RowMetadata } from '@google-cloud/bigquery'
import { Injectable } from '@nestjs/common'

@Injectable()
export class BigQueryService {
  client: BigQuery
  constructor() {
    this.client = new BigQuery({
      credentials:
        process.env.BIG_QUERY_APPLICATION_JSON != null
          ? JSON.parse(process.env.BIG_QUERY_APPLICATION_JSON)
          : undefined
    })
  }

  async bigQueryRowIterator(table: string): Promise<{
    next: () => Promise<{
      done: boolean
      value: RowMetadata
    }>
  }> {
    const maxResults = 500
    let jobRes

    const query = `SELECT * FROM \`${table}\``

    try {
      const [job] = await this.client.createQueryJob({ query })
      jobRes = job
    } catch (e) {
      throw new Error(`failed to create job in Big Query: ${e.message}`)
    }

    let rowRes
    let pageToken: string | undefined
    let results: unknown[] = []

    let maxRows = 0
    let returnedResults = 0

    return {
      async next() {
        returnedResults++
        if (results.length === 0) {
          try {
            const res = await jobRes.getQueryResults({ maxResults, pageToken })
            results = res[0]
            pageToken = res[1]?.pageToken
            maxRows = +res[2]?.totalRows
          } catch (e) {
            throw new Error(
              `failed to fetch query results from Big Query: ${e.message}`
            )
          }
        }
        rowRes = results.shift()
        return {
          done: returnedResults === maxRows + 1,
          value: rowRes
        }
      }
    }
  }
}
