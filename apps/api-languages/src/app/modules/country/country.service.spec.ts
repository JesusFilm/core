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
  slug: [{ value: 'United-States', languageId: '529', primary: true }],
  languageIds: ['529'],
  latitude: 10,
  longitude: -20.1
}
describe('CountryService', () => {
  let service: CountryService
  let db: DeepMockProxy<Database>

  beforeEach(async () => {
    db = mockDeep()
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

  it('should query by slug', async () => {
    db.query.mockImplementationOnce(async (q) => {
      const { query, bindVars } = q as unknown as AqlQuery
      expect(query).toEqual(`
    FOR item IN 
      FILTER @value0 IN item.slug[*].value
      LIMIT 1
      RETURN item
    `)
      expect(bindVars).toEqual({
        value0: 'United-States'
      })
      return { next: () => country } as unknown as ArrayCursor
    })
    expect(await service.getCountryBySlug('United-States')).toEqual(country)
  })
})
