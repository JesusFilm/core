import { graphql } from 'gql.tada'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'

describe('seoContent', () => {
  const client = getClient()

  const authClient = getClient({
    headers: {
      authorization: 'token'
    },
    context: {
      currentRoles: ['publisher']
    }
  })

  describe('mutations', () => {
    describe('seoContentCreate', () => {
      const CREATE_SEO_CONTENT_MUTATION = graphql(`
        mutation CreateSeoContent($input: SeoContentCreateInput!) {
          seoContentCreate(input: $input) {
            id
            title
            description
            keywords
            content
            primary
            language {
              id
            }
          }
        }
      `)

      it('should create SEO content', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.seoContent.create.mockResolvedValue({
          id: 'id',
          videoId: 'videoId',
          title: 'Test Title',
          description: 'Test Description',
          keywords: 'test,keywords',
          content: 'Test Content',
          primary: true,
          languageId: 'languageId'
        })
        const result = await authClient({
          document: CREATE_SEO_CONTENT_MUTATION,
          variables: {
            input: {
              videoId: 'videoId',
              title: 'Test Title',
              description: 'Test Description',
              keywords: 'test,keywords',
              content: 'Test Content',
              primary: true,
              languageId: 'languageId'
            }
          }
        })
        expect(result).toHaveProperty('data.seoContentCreate', {
          id: 'id',
          title: 'Test Title',
          description: 'Test Description',
          keywords: 'test,keywords',
          content: 'Test Content',
          primary: true,
          language: { id: 'languageId' }
        })
      })

      it('should reject if not publisher', async () => {
        const result = await client({
          document: CREATE_SEO_CONTENT_MUTATION,
          variables: {
            input: {
              videoId: 'videoId',
              title: 'Test Title',
              description: 'Test Description',
              keywords: 'test,keywords',
              content: 'Test Content',
              primary: true,
              languageId: 'languageId'
            }
          }
        })
        expect(result).toHaveProperty('data', null)
      })
    })

    describe('seoContentUpdate', () => {
      const UPDATE_SEO_CONTENT_MUTATION = graphql(`
        mutation UpdateSeoContent($input: SeoContentUpdateInput!) {
          seoContentUpdate(input: $input) {
            id
            title
            description
            keywords
            content
            primary
            language {
              id
            }
          }
        }
      `)

      it('should update SEO content', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.seoContent.update.mockResolvedValue({
          id: 'id',
          videoId: 'videoId',
          title: 'Updated Title',
          description: 'Updated Description',
          keywords: 'test,keywords',
          content: 'Test Content',
          primary: true,
          languageId: 'languageId'
        })
        const result = await authClient({
          document: UPDATE_SEO_CONTENT_MUTATION,
          variables: {
            input: {
              id: 'id',
              title: 'Updated Title',
              description: 'Updated Description'
            }
          }
        })
        expect(result).toHaveProperty('data.seoContentUpdate', {
          id: 'id',
          title: 'Updated Title',
          description: 'Updated Description',
          keywords: 'test,keywords',
          content: 'Test Content',
          primary: true,
          language: { id: 'languageId' }
        })
      })

      it('should reject if not publisher', async () => {
        const result = await client({
          document: UPDATE_SEO_CONTENT_MUTATION,
          variables: {
            input: {
              id: 'id',
              title: 'Updated Title',
              description: 'Updated Description'
            }
          }
        })
        expect(result).toHaveProperty('data', null)
      })
    })

    describe('seoContentDelete', () => {
      const DELETE_SEO_CONTENT_MUTATION = graphql(`
        mutation DeleteSeoContent($id: ID!) {
          seoContentDelete(id: $id) {
            id
          }
        }
      `)

      it('should delete SEO content', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.seoContent.delete.mockResolvedValue({
          id: 'id',
          videoId: 'videoId',
          title: 'Test Title',
          description: 'Test Description',
          keywords: 'test,keywords',
          content: 'Test Content',
          primary: true,
          languageId: 'languageId'
        })
        const result = await authClient({
          document: DELETE_SEO_CONTENT_MUTATION,
          variables: {
            id: 'id'
          }
        })
        expect(result).toHaveProperty('data.seoContentDelete', {
          id: 'id'
        })
      })

      it('should reject if not publisher', async () => {
        const result = await client({
          document: DELETE_SEO_CONTENT_MUTATION,
          variables: {
            id: 'id'
          }
        })
        expect(result).toHaveProperty('data', null)
      })
    })
  })
})
