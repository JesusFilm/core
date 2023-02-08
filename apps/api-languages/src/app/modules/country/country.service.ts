import { BaseService } from '@core/nest/database/BaseService'
import { KeyAsId } from '@core/nest/decorators/KeyAsId'
import { Injectable } from '@nestjs/common'
import { aql } from 'arangojs'
import { Country } from '../../__generated__/graphql'

@Injectable()
export class CountryService extends BaseService<Country> {
  collection = this.db.collection<Country>('countries')
  @KeyAsId()
  async getCountryBySlug(slug: string): Promise<Country> {
    const res = await this.db.query(aql`
    FOR item IN ${this.collection}
      FILTER ${slug} IN item.slug[*].value
      LIMIT 1
      RETURN item
    `)
    return await res.next()
  }
}
