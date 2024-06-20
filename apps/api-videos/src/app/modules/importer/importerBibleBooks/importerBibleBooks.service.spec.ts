import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { PrismaService } from '../../../lib/prisma.service'
import { ImporterBibleBooksService } from './importerBibleBooks.service'

describe('ImporterBibleBooksService', () => {
  let service: ImporterBibleBooksService,
    prismaService: DeepMockProxy<PrismaService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImporterBibleBooksService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()

    service = module.get<ImporterBibleBooksService>(ImporterBibleBooksService)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  describe('import', () => {
    it('should upsert bible book', async () => {
      await service.import({
        id: 1,
        osisId: 'Gen',
        alternateName: null,
        paratextAbbreviation: 'GEN',
        isNewTestament: 0,
        order: 1,
        extraStuff: 'randomData'
      })
      expect(prismaService.bibleBook.upsert).toHaveBeenCalledWith({
        where: { id: '1' },
        update: {
          id: '1',
          osisId: 'Gen',
          alternateName: null,
          paratextAbbreviation: 'GEN',
          isNewTestament: false,
          order: 1
        },
        create: {
          id: '1',
          osisId: 'Gen',
          alternateName: null,
          paratextAbbreviation: 'GEN',
          isNewTestament: false,
          order: 1
        }
      })
    })

    it('should save many bible books', async () => {
      await service.importMany([
        {
          id: 1,
          osisId: 'Gen',
          alternateName: null,
          paratextAbbreviation: 'GEN',
          isNewTestament: 0,
          order: 1,
          extraStuff: 'randomData'
        },
        {
          id: 21,
          osisId: 'Eccl',
          alternateName: 'Qohelet',
          paratextAbbreviation: 'ECC',
          isNewTestament: 0,
          order: 21,
          extraStuff: 'randomData'
        }
      ])
      expect(prismaService.bibleBook.createMany).toBeCalledWith({
        data: [
          {
            id: '1',
            osisId: 'Gen',
            alternateName: null,
            paratextAbbreviation: 'GEN',
            isNewTestament: false,
            order: 1
          },
          {
            id: '21',
            osisId: 'Eccl',
            alternateName: 'Qohelet',
            paratextAbbreviation: 'ECC',
            isNewTestament: false,
            order: 21
          }
        ],
        skipDuplicates: true
      })
    })

    it('should throw error when row is invalid', async () => {
      await expect(
        service.import({
          id: 1,
          osisId: 'Gen'
        })
      ).rejects.toThrow('row does not match schema: 1')
    })

    it('should throw error when some rows are invalid', async () => {
      await expect(
        service.importMany([
          {
            id: 1,
            osisId: 'Gen',
            alternateName: null,
            paratextAbbreviation: 'GEN',
            isNewTestament: 0,
            order: 1,
            extraStuff: 'randomData'
          },
          {
            osisId: 'Eccl'
          }
        ])
      ).rejects.toThrow('some rows do not match schema: unknownId')
    })
  })
})
