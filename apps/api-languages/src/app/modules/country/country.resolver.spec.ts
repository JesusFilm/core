import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'
import { IdType } from '../../__generated__/graphql'
import { LanguageService } from '../language/language.service'
import { CountryResolver } from './country.resolver'
import { CountryService } from './country.service'

describe('LangaugeResolver', () => {
  let resolver: CountryResolver, service: CountryService

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

  beforeEach(async () => {
    const countryService = {
      provide: CountryService,
      useFactory: () => ({
        get: jest.fn(() => country),
        getCountryByPermalink: jest.fn(() => country),
        getAll: jest.fn(() => [country, country])
      })
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountryResolver,
        countryService,
        LanguageService,
        { provide: 'DATABASE', useFactory: () => mockDeep<Database>() }
      ]
    }).compile()
    resolver = module.get<CountryResolver>(CountryResolver)
    service = await module.resolve(CountryService)
  })

  describe('countries', () => {
    it('returns Countries', async () => {
      expect(await resolver.countries()).toEqual([country, country])
      expect(service.getAll).toHaveBeenCalledWith()
    })
  })

  describe('country', () => {
    it('should return country', async () => {
      expect(await resolver.country(country.id)).toEqual(country)
      expect(service.get).toHaveBeenCalledWith(country.id)
    })

    it('should return country by slug', async () => {
      expect(await resolver.country(country.id, IdType.slug)).toEqual(country)
      expect(service.getCountryByPermalink).toHaveBeenCalledWith(country.id)
    })
  })

  describe('name', () => {
    it('should return translations', () => {
      expect(resolver.name(country)).toEqual(country.name)
    })

    it('should return translations filtered by countryId', () => {
      expect(resolver.name(country, '529')).toEqual([country.name[0]])
    })

    it('should return translations filtered by primary', () => {
      expect(resolver.name(country, undefined, true)).toEqual([country.name[0]])
    })
  })

  describe('permalink', () => {
    it('should return translations', () => {
      expect(resolver.permalink(country)).toEqual(country.permalink)
    })

    it('should return translations filtered by countryId', () => {
      expect(resolver.permalink(country, '529')).toEqual([country.permalink[0]])
    })

    it('should return translations filtered by primary', () => {
      expect(resolver.permalink(country, undefined, true)).toEqual([
        country.permalink[0]
      ])
    })
  })

  describe('continent', () => {
    it('should return translations', () => {
      expect(resolver.continent(country)).toEqual(country.continent)
    })

    it('should return translations filtered by countryId', () => {
      expect(resolver.continent(country, '529')).toEqual([country.continent[0]])
    })

    it('should return translations filtered by primary', () => {
      expect(resolver.continent(country, undefined, true)).toEqual([
        country.continent[0]
      ])
    })
  })

  describe('resolveReference', () => {
    it('should return country', async () => {
      expect(
        await resolver.resolveReference({
          __typename: 'Country',
          id: country.id
        })
      ).toEqual(country)
    })
  })
})
