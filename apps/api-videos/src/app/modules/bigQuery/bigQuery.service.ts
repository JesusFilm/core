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
    singleRow = true
  ): AsyncGenerator<RowMetadata | RowMetadata[], void, unknown> {
    const job = await this.createQueryJob(table, lastImport)
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
    lastImport: Date | undefined
  ): Promise<Job> {
    try {
      const query = `SELECT * FROM \`${table}\`${
        lastImport != null
          ? ` WHERE updatedAt > \`${lastImport.toISOString()}\``
          : ``
      }`
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
}
