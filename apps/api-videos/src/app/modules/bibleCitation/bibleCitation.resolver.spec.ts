import { CacheModule } from '@nestjs/cache-manager'
import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { PrismaService } from '../../lib/prisma.service'

import { BibleCitationResolver } from './bibleCitation.resolver'

describe('BibleCitationResolver', () => {
  let resolver: BibleCitationResolver,
    prismaService: DeepMockProxy<PrismaService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        BibleCitationResolver,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()
    resolver = module.get<BibleCitationResolver>(BibleCitationResolver)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  describe('bibleBook', () => {
    it('returns bible book', async () => {
      prismaService.bibleBook.findUnique.mockResolvedValue({
        id: 'bibleBookId',
        osisId: 'osisId',
        alternateName: 'alternateName',
        paratextAbbreviation: 'paratextAbbreviation',
        isNewTestament: true,
        order: 1
      })
      expect(
        await resolver.bibleBook({
          id: 'bibleCitationId',
          bibleBookId: 'bibleBookId'
        })
      ).toEqual({
        id: 'bibleBookId',
        alternateName: 'alternateName',
        isNewTestament: true,
        order: 1,
        osisId: 'osisId',
        paratextAbbreviation: 'paratextAbbreviation'
      })
      expect(prismaService.bibleBook.findUnique).toHaveBeenCalledWith({
        where: { id: 'bibleBookId' }
      })
    })
  })
})
