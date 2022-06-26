import { BaseService } from '@core/nest/database/BaseService'
import { KeyAsId } from '@core/nest/decorators/KeyAsId'
import { Injectable } from '@nestjs/common'
import { aql } from 'arangojs'
import { DocumentCollection } from 'arangojs/collection'

@Injectable()
export class CountryService extends BaseService {
  collection: DocumentCollection = this.db.collection('countries')
  @KeyAsId()
  async getCountryBySlug<T>(slug: string): Promise<T> {
    const res = await this.db.query(aql`
    FOR item IN ${this.collection}
      FILTER ${slug} IN item.slug[*].value
      LIMIT 1
      RETURN {
        _key: item._key,
        name: item.name,
        population: item.population,
        continent: item.continent,
        slug: item.slug,
        languageIds: item.languageIds,
        latitude: item.latitude,
        longitude: item.longitude
      }
    `)
    return await res.next()
  }
}
