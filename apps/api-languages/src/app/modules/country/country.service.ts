import { BaseService } from '@core/nest/database'
import { KeyAsId } from '@core/nest/decorators'
import { Injectable } from '@nestjs/common'
import { aql } from 'arangojs'
import { DocumentCollection } from 'arangojs/collection'

@Injectable()
export class CountryService extends BaseService {
  collection: DocumentCollection = this.db.collection('countries')
  @KeyAsId()
  async getCountryByPermalink<T>(permalink: string): Promise<T> {
    const res = await this.db.query(aql`
    FOR item IN ${this.collection}
      FILTER ${permalink} IN item.permalink[*].value
      LIMIT 1
      RETURN {
        _key: item._key,
        name: item.name,
        population: item.population,
        continent: item.continent,
        permalink: item.permalink,
        languageIds: item.languageIds,
        latitude: item.latitude,
        longitude: item.longitude
      }
    `)
    return await res.next()
  }
}
