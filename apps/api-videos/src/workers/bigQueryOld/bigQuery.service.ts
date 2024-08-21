import { BigQuery, Job, RowMetadata } from '@google-cloud/bigquery'
import { Injectable } from '@nestjs/common'

interface QueryResults {
  data: RowMetadata[]
  pageToken?: string
}

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

  async *getRowsFromTable(
    table: string,
    lastImport: Date | undefined,
    hasUpdatedAt: boolean,
    singleRow = true
  ): AsyncGenerator<RowMetadata | RowMetadata[], void, unknown> {
    const job = await this.createQueryJob(table, lastImport, hasUpdatedAt)
    let results: QueryResults = { data: [] }

    do {
      if (results.data.length === 0)
        results = await this.getQueryResults(job, results.pageToken)
      if (singleRow) {
        yield results.data.shift()
      } else {
        yield results.data
        results.data = []
      }
    } while (results.data.length > 0 || results.pageToken != null)
  }

  private async createQueryJob(
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
      const [job] = await this.client.createQueryJob({
        query,
        params,
        location: 'US'
      })

      return job
    } catch (e) {
      throw new Error(`failed to create job in Big Query: ${e.message}`)
    }
  }

  private async getQueryResults(
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
      throw new Error(`failed to create job in Big Query: ${e.message}`)
    }
  }

  async getCurrentTimeStamp(): Promise<string> {
    const [result] = await this.client.query('SELECT CURRENT_TIMESTAMP()')
    return result[0].f0_.value
  }
}
