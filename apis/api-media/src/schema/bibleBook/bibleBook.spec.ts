import { BibleBook, BibleBookName } from '@core/prisma/media/client'
import { graphql } from '@core/shared/gql'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'

describe('BibleBook', () => {
  const client = getClient()

  describe('bibleBooks', () => {
    const BIBLE_BOOKS_QUERY = graphql(`
      query BibleBooks($languageId: ID, $primary: Boolean) {
        bibleBooks {
          id
          name(languageId: $languageId, primary: $primary) {
            value
            primary
            language {
              id
            }
          }
          osisId
          alternateName
          paratextAbbreviation
          isNewTestament
          order
        }
      }
    `)

    it('should query bibleBooks', async () => {
      prismaMock.bibleBook.findMany.mockResolvedValue([
        {
          id: '1',
          name: [
            {
              value: 'Genesis',
              primary: true,
              languageId: '529'
            }
          ],
          osisId: 'Gen',
          alternateName: 'First Book of Moses',
          paratextAbbreviation: 'GEN',
          isNewTestament: false,
          order: 1
        }
      ] as Array<BibleBook & { name: BibleBookName[] }>)
      const data = await client({
        document: BIBLE_BOOKS_QUERY
      })
      expect(prismaMock.bibleBook.findMany).toHaveBeenCalledWith({
        include: {
          name: {
            orderBy: {
              primary: 'desc'
            },
            where: {
              OR: [
                {
                  languageId: '529'
                }
              ]
            }
          }
        },
        where: { updatedAt: undefined },
        orderBy: { order: 'asc' }
      })
      expect(data).toHaveProperty('data.bibleBooks', [
        {
          id: '1',
          name: [
            {
              value: 'Genesis',
              primary: true,
              language: { id: '529' }
            }
          ],
          osisId: 'Gen',
          alternateName: 'First Book of Moses',
          paratextAbbreviation: 'GEN',
          isNewTestament: false,
          order: 1
        }
      ])
    })

    it('should query bibleBooks with languageId', async () => {
      prismaMock.bibleBook.findMany.mockResolvedValue([
        {
          id: '1',
          name: [
            {
              value: 'Genesis',
              primary: true,
              languageId: '529'
            },
            {
              value: 'Genèse',
              primary: false,
              languageId: '987'
            }
          ],
          osisId: 'Gen',
          alternateName: 'First Book of Moses',
          paratextAbbreviation: 'GEN',
          isNewTestament: false,
          order: 1
        }
      ] as Array<BibleBook & { name: BibleBookName[] }>)
      const data = await client({
        document: BIBLE_BOOKS_QUERY,
        variables: { languageId: '987', primary: true }
      })
      expect(prismaMock.bibleBook.findMany).toHaveBeenCalledWith({
        include: {
          name: {
            orderBy: {
              primary: 'desc'
            },
            where: {
              OR: [
                {
                  primary: true
                },
                {
                  languageId: '987'
                }
              ]
            }
          }
        },
        where: { updatedAt: undefined },
        orderBy: { order: 'asc' }
      })
      expect(data).toHaveProperty('data.bibleBooks', [
        {
          id: '1',
          name: [
            {
              value: 'Genesis',
              primary: true,
              language: { id: '529' }
            },
            {
              value: 'Genèse',
              primary: false,
              language: { id: '987' }
            }
          ],
          osisId: 'Gen',
          alternateName: 'First Book of Moses',
          paratextAbbreviation: 'GEN',
          isNewTestament: false,
          order: 1
        }
      ])
    })

    it('should query bibleBooks with updatedAt filter', async () => {
      prismaMock.bibleBook.findMany.mockResolvedValue([
        {
          id: '1',
          name: [
            {
              value: 'Genesis',
              primary: true,
              languageId: '529'
            }
          ],
          osisId: 'Gen',
          alternateName: 'First Book of Moses',
          paratextAbbreviation: 'GEN',
          isNewTestament: false,
          order: 1,
          updatedAt: new Date('2025-01-01T00:00:00.000Z')
        }
      ] as Array<BibleBook & { name: BibleBookName[] }>)

      const BIBLE_BOOKS_FILTER_QUERY = graphql(`
        query BibleBooksWithFilter($where: BibleBooksFilter) {
          bibleBooks(where: $where) {
            id
            updatedAt
          }
        }
      `)

      const data = await client({
        document: BIBLE_BOOKS_FILTER_QUERY,
        variables: {
          where: { updatedAt: { gte: '2025-01-01T00:00:00.000Z' } }
        }
      })

      expect(prismaMock.bibleBook.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            updatedAt: { gte: new Date('2025-01-01T00:00:00.000Z') }
          }
        })
      )
      expect(data).toHaveProperty('data.bibleBooks', [
        {
          id: '1',
          updatedAt: '2025-01-01T00:00:00.000Z'
        }
      ])
    })
  })
})
