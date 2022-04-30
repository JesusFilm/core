import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { AqlQuery } from 'arangojs/aql'
import { ArrayCursor } from 'arangojs/cursor'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { CountryService } from './country.service'

const country = {
  id: 'US',
  name: [{ value: 'United States', languageId: '529', primary: true }],
  population: 500000000,
  continent: [{ value: 'North America', languageId: '529', primary: true }],
  permalink: [{ value: 'United-States', languageId: '529', primary: true }],
  languageIds: ['529'],
  latitude: 10,
  longitude: -20.1
}
describe('CountryService', () => {
  let service: CountryService
  let db: DeepMockProxy<Database>

  beforeEach(async () => {
    db = mockDeep<Database>()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountryService,
        {
          provide: 'DATABASE',
          useFactory: () => db
        }
      ]
    }).compile()

    service = module.get<CountryService>(CountryService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should query by permalink', async () => {
    db.query.mockImplementationOnce(async (q) => {
      const { query, bindVars } = q as unknown as AqlQuery
      expect(query).toEqual(`
    FOR item IN 
      FILTER @value0 IN item.permalink[*].value
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
      expect(bindVars).toEqual({
        value0: 'United-States'
      })
      return { next: () => country } as unknown as ArrayCursor
    })
    expect(await service.getCountryByPermalink('United-States')).toEqual(
      country
    )
  })
})
