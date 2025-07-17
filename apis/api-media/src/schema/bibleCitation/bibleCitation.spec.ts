import { BibleCitation } from '.prisma/api-media-client'
import { graphql } from '@core/shared/gql'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'

describe('BibleCitation', () => {
  const client = getClient()
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentRoles: ['publisher'] }
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
          chapterEnd: -1,
          verseStart: 1,
          verseEnd: -1,
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
      expect(prismaMock.bibleCitation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            bibleBook: true,
            video: true
          },
          orderBy: { order: 'asc' }
        })
      )
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

  describe('bibleCitation', () => {
    const BIBLE_CITATION_QUERY = graphql(`
      query BibleCitation($id: ID!) {
        bibleCitation(id: $id) {
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
          order
        }
      }
    `)

    it('should query bibleCitation by id', async () => {
      prismaMock.bibleCitation.findUniqueOrThrow.mockResolvedValue({
        id: '1',
        osisId: 'Exo',
        bibleBookId: 'bookId',
        bibleBook: { id: 'bookId' },
        chapterStart: 3,
        chapterEnd: 5,
        verseStart: -1,
        verseEnd: -1,
        videoId: 'videoId',
        video: { id: 'videoId' },
        order: 2
      } as BibleCitation & { bibleBook: { id: string }; video: { id: string } })

      const data = await client({
        document: BIBLE_CITATION_QUERY,
        variables: { id: '1' }
      })

      expect(prismaMock.bibleCitation.findUniqueOrThrow).toHaveBeenCalledWith({
        include: {
          bibleBook: true,
          video: true
        },
        where: { id: '1' }
      })
      expect(data).toHaveProperty('data.bibleCitation', {
        id: '1',
        osisId: 'Exo',
        bibleBook: { id: 'bookId' },
        chapterStart: 3,
        chapterEnd: 5,
        verseStart: null,
        verseEnd: null,
        video: { id: 'videoId' },
        order: 2
      })
    })
  })

  describe('mutations', () => {
    describe('bibleCitationCreate', () => {
      const CREATE_MUTATION = graphql(`
        mutation CreateBibleCitation(
          $input: MutationBibleCitationCreateInput!
        ) {
          bibleCitationCreate(input: $input) {
            id
          }
        }
      `)

      it('should create bibleCitation', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userRoleId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.bibleCitation.create.mockResolvedValue({
          id: 'newId'
        } as unknown as BibleCitation)
        const result = await authClient({
          document: CREATE_MUTATION,
          variables: {
            input: {
              id: 'newId',
              osisId: 'Gen',
              bibleBookId: 'bibleBookId',
              videoId: 'videoId',
              chapterStart: 1,
              chapterEnd: 2,
              verseStart: 3,
              verseEnd: 4,
              order: 5
            }
          }
        })

        expect(prismaMock.bibleCitation.create).toHaveBeenCalledWith({
          data: {
            id: 'newId',
            osisId: 'Gen',
            bibleBookId: 'bibleBookId',
            videoId: 'videoId',
            chapterStart: 1,
            chapterEnd: 2,
            verseStart: 3,
            verseEnd: 4,
            order: 5
          }
        })
        expect(result).toHaveProperty('data.bibleCitationCreate', {
          id: 'newId'
        })
      })

      it('should fail if not publisher', async () => {
        const result = await client({
          document: CREATE_MUTATION,
          variables: {
            input: {
              id: 'newId',
              osisId: 'Gen',
              bibleBookId: 'bibleBookId',
              videoId: 'videoId',
              chapterStart: 1,
              order: 0
            }
          }
        })

        expect(result).toHaveProperty('data.bibleCitationCreate', null)
      })
    })

    describe('bibleCitationUpdate', () => {
      const UPDATE_MUTATION = graphql(`
        mutation BibleCitationUpdate(
          $input: MutationBibleCitationUpdateInput!
        ) {
          bibleCitationUpdate(input: $input) {
            id
          }
        }
      `)

      it('should update bibleCitation', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userRoleId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.bibleCitation.update.mockResolvedValue({
          id: 'updatedId'
        } as unknown as BibleCitation)
        const result = await authClient({
          document: UPDATE_MUTATION,
          variables: {
            input: {
              id: 'existingId',
              osisId: 'Rev',
              chapterStart: 2,
              chapterEnd: 3,
              verseStart: 4,
              verseEnd: 5,
              order: 1
            }
          }
        })

        expect(prismaMock.bibleCitation.update).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id: 'existingId' },
            data: expect.objectContaining({
              osisId: 'Rev',
              chapterStart: 2,
              chapterEnd: 3,
              verseStart: 4,
              verseEnd: 5,
              order: 1
            })
          })
        )
        expect(result).toHaveProperty('data.bibleCitationUpdate', {
          id: 'updatedId'
        })
      })

      it('should fail if not publisher', async () => {
        const result = await client({
          document: UPDATE_MUTATION,
          variables: { input: { id: 'existingId', osisId: 'Rev' } }
        })

        expect(result).toHaveProperty('data.bibleCitationUpdate', null)
      })
    })

    describe('bibleCitationDelete', () => {
      const DELETE_MUTATION = graphql(`
        mutation BibleCitationDelete($id: ID!) {
          bibleCitationDelete(id: $id)
        }
      `)

      it('should delete bibleCitation', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userRoleId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.bibleCitation.delete.mockResolvedValue({
          id: 'deleteId',
          osisId: 'Gen',
          bibleBookId: 'bibleBookId',
          chapterStart: 1,
          chapterEnd: -1,
          verseStart: 1,
          verseEnd: -1,
          videoId: 'videoId',
          order: 0
        } as unknown as BibleCitation)
        const result = await authClient({
          document: DELETE_MUTATION,
          variables: { id: 'deleteId' }
        })

        expect(prismaMock.bibleCitation.delete).toHaveBeenCalledWith({
          where: { id: 'deleteId' }
        })
        expect(result).toHaveProperty('data.bibleCitationDelete', true)
      })

      it('should fail if not publisher', async () => {
        const result = await client({
          document: DELETE_MUTATION,
          variables: { id: 'deleteId' }
        })

        expect(result).toHaveProperty('data.bibleCitationDelete', null)
      })
    })
  })
})
