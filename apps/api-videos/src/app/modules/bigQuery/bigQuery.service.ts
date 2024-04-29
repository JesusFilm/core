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
    table: string
  ): AsyncGenerator<RowMetadata, void, unknown> {
    const job = await this.createQueryJob(table)
    let results: QueryResults = { data: [] }

    do {
      if (results.data.length === 0)
        results = await this.getQueryResults(job, results.pageToken)
      yield results.data.shift()
    } while (results.data.length > 0 || results.pageToken != null)
  }

  private async createQueryJob(table: string): Promise<Job> {
    try {
      const query = `SELECT * FROM \`${table}\``
      const [job] = await this.client.createQueryJob({ query })
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
        maxResults: 500,
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
}
