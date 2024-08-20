import { graphql } from 'gql.tada'

import { BibleCitation } from '.prisma/api-videos-client'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { cache } from '../../yoga'

describe('BibleCitation', () => {
  const client = getClient()

  afterEach(async () => {
    await cache.invalidate([{ typename: 'BibleCitation' }])
  })

  describe('bibleCitations', () => {
    const BIBLE_CITATIONS_QUERY = graphql(`
      query BibleCitations {
        bibleCitations {
          id
          osisId
          bibleBook {
            id
          }
          chapterStart
          chapterEnd
          verseStart
          verseEnd
          video {
            id
          }
        }
      }
    `)

    it('should query bibleCitations', async () => {
      prismaMock.bibleCitation.findMany.mockResolvedValue([
        {
          id: '1',
          osisId: 'Gen',
          bibleBookId: 'bibleBookId',
          bibleBook: { id: 'bibleBookId' },
          chapterStart: 1,
          chapterEnd: null,
          verseStart: 1,
          verseEnd: null,
          videoId: 'videoId',
          video: { id: 'videoId' },
          order: 0
        }
      ] as [
        BibleCitation & {
          bibleBook: { id: string }
          video: { id: string }
        }
      ])
      const data = await client({
        document: BIBLE_CITATIONS_QUERY
      })
      expect(prismaMock.bibleCitation.findMany).toHaveBeenCalledWith({
        include: {
          bibleBook: true,
          video: true
        }
      })
      expect(data).toHaveProperty('data.bibleCitations', [
        {
          id: '1',
          osisId: 'Gen',
          bibleBook: { id: 'bibleBookId' },
          chapterStart: 1,
          chapterEnd: null,
          verseStart: 1,
          verseEnd: null,
          video: { id: 'videoId' }
        }
      ])
    })
  })
})
