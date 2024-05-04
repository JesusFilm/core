import get from 'lodash/get'
import { AnyObject, ObjectSchema } from 'yup'

export class ImporterService<T extends AnyObject = AnyObject> {
  schema: ObjectSchema<T>

  async import(row: unknown): Promise<void> {
    if (await this.schema.isValid(row)) {
      const data = this.schema.noUnknown().cast(row)
      await this.save(data as T)
    } else {
      throw new Error(
        `row does not match schema: ${
          get(row, 'id') ?? 'unknownId'
        }\n${JSON.stringify(row, null, 2)}`
      )
    }
  }

  /**
   * Save the data to the database.
   * Should only receive validated and casted object by the schema.
   * @param data is of type T and is the data to be saved to the database
   */
  protected async save(data: T): Promise<void> {
    throw new Error('save not implemented')
  }
}
