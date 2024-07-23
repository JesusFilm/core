import { CacheModule } from '@nestjs/cache-manager'
import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { PrismaService } from '../../lib/prisma.service'

import { BibleBookResolver } from './bibleBook.resolver'

const bibleBook = {
  id: 'bibleBookId'
}

const bibleBookName = {
  id: 'bibleBookNameId',
  value: 'Genesis',
  primary: true,
  languageId: '529',
  bibleBookId: 'bibleBookId'
}

const bibleBookNames = [bibleBookName, bibleBookName]

describe('BibleBookResolver', () => {
  let resolver: BibleBookResolver, prismaService: DeepMockProxy<PrismaService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        BibleBookResolver,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()
    resolver = module.get<BibleBookResolver>(BibleBookResolver)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    prismaService.bibleBookName.findMany.mockResolvedValue(bibleBookNames)
  })

  describe('name', () => {
    it('returns names', async () => {
      expect(await resolver.name(bibleBook)).toEqual(bibleBookNames)
      expect(prismaService.bibleBookName.findMany).toHaveBeenCalledWith({
        where: {
          bibleBookId: bibleBook.id
        },
        orderBy: { primary: 'desc' }
      })
    })

    it('returns filtered names', async () => {
      expect(await resolver.name(bibleBook, '529', true)).toEqual(
        bibleBookNames
      )
      expect(prismaService.bibleBookName.findMany).toHaveBeenCalledWith({
        where: {
          bibleBookId: bibleBook.id,
          OR: [{ languageId: '529' }, { primary: true }]
        },
        orderBy: { primary: 'desc' }
      })
    })
  })
})
