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
  })
})
