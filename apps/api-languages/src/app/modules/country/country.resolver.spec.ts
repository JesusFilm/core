import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { PrismaService } from '../../lib/prisma.service'

import { CountryResolver } from './country.resolver'

describe('CountryResolver', () => {
  let resolver: CountryResolver, prismaService: DeepMockProxy<PrismaService>

  const country = {
    id: 'US',
    population: 500000000,
    latitude: 10,
    longitude: -20.1,
    flagPngSrc: 'flag.png',
    flagWebpSrc: 'flag.webp'
  }
  const countryName = {
    id: '1',
    countryId: country.id,
    value: 'United States',
    languageId: '529',
    primary: true
  }
  const countryContinent = {
    id: '1',
    countryId: country.id,
    value: 'North America',
    languageId: '529',
    primary: true
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountryResolver,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()
    resolver = module.get<CountryResolver>(CountryResolver)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  describe('countries', () => {
    it('returns Countries', async () => {
      prismaService.country.findMany.mockResolvedValue([country, country])
      expect(await resolver.countries()).toEqual([country, country])
      expect(prismaService.country.findMany).toHaveBeenCalledWith()
    })
  })

  describe('country', () => {
    it('should return country', async () => {
      prismaService.country.findUnique.mockResolvedValue(country)
      expect(await resolver.country(country.id)).toEqual(country)
      expect(prismaService.country.findUnique).toHaveBeenCalledWith({
        where: { id: country.id }
      })
    })
  })

  describe('name', () => {
    it('should return translations', async () => {
      prismaService.countryName.findMany.mockResolvedValueOnce([
        countryName,
        countryName
      ])
      expect(await resolver.name(country)).toEqual([countryName, countryName])
      expect(prismaService.countryName.findMany).toHaveBeenCalledWith({
        where: { countryId: country.id },
        orderBy: { primary: 'desc' }
      })
    })

    it('should return translations filtered by countryId', async () => {
      prismaService.countryName.findMany.mockResolvedValueOnce([countryName])
      expect(await resolver.name(country, '529')).toEqual([countryName])
      expect(prismaService.countryName.findMany).toHaveBeenCalledWith({
        where: { countryId: country.id, OR: [{ languageId: '529' }] },
        orderBy: { primary: 'desc' }
      })
    })

    it('should return translations filtered by primary', async () => {
      prismaService.countryName.findMany.mockResolvedValueOnce([countryName])
      expect(await resolver.name(country, undefined, true)).toEqual([
        countryName
      ])
      expect(prismaService.countryName.findMany).toHaveBeenCalledWith({
        where: { countryId: country.id, OR: [{ primary: true }] },
        orderBy: { primary: 'desc' }
      })
    })
  })

  describe('continent', () => {
    it('should return translations', async () => {
      prismaService.countryContinent.findMany.mockResolvedValueOnce([
        countryContinent,
        countryContinent
      ])
      expect(await resolver.continent(country)).toEqual([
        countryContinent,
        countryContinent
      ])
      expect(prismaService.countryContinent.findMany).toHaveBeenCalledWith({
        where: { countryId: country.id },
        orderBy: { primary: 'desc' }
      })
    })

    it('should return translations filtered by countryId', async () => {
      prismaService.countryContinent.findMany.mockResolvedValueOnce([
        countryContinent
      ])
      expect(await resolver.continent(country, '529')).toEqual([
        countryContinent
      ])
      expect(prismaService.countryContinent.findMany).toHaveBeenCalledWith({
        where: { countryId: country.id, OR: [{ languageId: '529' }] },
        orderBy: { primary: 'desc' }
      })
    })

    it('should return translations filtered by primary', async () => {
      prismaService.countryContinent.findMany.mockResolvedValueOnce([
        countryContinent
      ])
      expect(await resolver.continent(country, undefined, true)).toEqual([
        countryContinent
      ])
      expect(prismaService.countryContinent.findMany).toHaveBeenCalledWith({
        where: { countryId: country.id, OR: [{ primary: true }] },
        orderBy: { primary: 'desc' }
      })
    })
  })

  describe('resolveReference', () => {
    it('should return country', async () => {
      prismaService.country.findUnique.mockResolvedValueOnce(country)
      expect(
        await resolver.resolveReference({
          __typename: 'Country',
          id: country.id
        })
      ).toEqual(country)
    })
  })
})
