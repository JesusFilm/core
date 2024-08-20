import get from 'lodash/get'
import { ZodSchema } from 'zod'

export class ImporterService<T> {
  schema: ZodSchema

  async import(row: unknown): Promise<void> {
    const data = this.schema.safeParse(row)
    if (!data.success) {
      throw new Error(
        `row does not match schema: ${
          get(row, 'id') ?? 'unknownId'
        }\n${JSON.stringify(row, null, 2)}`
      )
    }
    await this.save(data.data as T)
  }

  async importMany(rows: unknown[]): Promise<void> {
    const validRows: unknown[] = []
    const inValidRowIds: string[] = []
    for (const row of rows) {
      const data = this.schema.safeParse(row)
      if (data.success) {
        validRows.push(data.data)
      } else {
        console.log(data.error)
        inValidRowIds.push(get(row, 'id') ?? 'unknownId')
      }
    }
    await this.saveMany(validRows as T[])
    if (validRows.length !== rows.length) {
      throw new Error(
        `some rows do not match schema: ${inValidRowIds.join(',')}`
      )
    }
  }

  /**
   * Save the data to the database.
   * Should only receive validated and casted object by the schema.
   * @param data is of type T and is the data to be saved to the database
   */
  protected async save(_data: T): Promise<void> {
    throw new Error('save not implemented')
  }

  protected async saveMany(_data: T[]): Promise<void> {
    throw new Error('saveMany not implemented')
  }
}
