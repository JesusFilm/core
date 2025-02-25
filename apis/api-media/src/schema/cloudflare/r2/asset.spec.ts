import { graphql } from 'gql.tada'

import { Video } from '.prisma/api-media-client'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('presignedUrl')
}))

describe('cloudflare/r2/asset', () => {
  const client = getClient()
  const authClient = getClient({
    headers: {
      authorization: 'token'
    },
    context: {
      user: { id: 'userId' },
      currentRoles: ['publisher']
    }
  })

  beforeAll(() => {
    process.env.CLOUDFLARE_R2_ENDPOINT = 'https://example.com'
    process.env.CLOUDFLARE_R2_ACCESS_KEY_ID = 'accessKeyId'
    process.env.CLOUDFLARE_R2_SECRET = 'secret'
    process.env.CLOUDFLARE_R2_BUCKET = 'bucket'
    process.env.CLOUDFLARE_R2_CUSTOM_DOMAIN = 'https://assets.jesusfilm.org'
  })

  describe('mutations', () => {
    describe('cloudflareR2Create', () => {
      const VIDEO_CLOUDFLARE_ASSETS_MUTATION = graphql(`
        mutation VideoCloudflareAssetsCreate($input: CloudflareR2CreateInput!) {
          cloudflareR2Create(input: $input) {
            id
            fileName
            uploadUrl
            userId
            publicUrl
            createdAt
            updatedAt
          }
        }
      `)

      it('should create a new r2 asset', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.video.findUnique.mockResolvedValue({
          id: 'videoId'
        } as Video)
        prismaMock.cloudflareR2.create.mockResolvedValue({
          id: 'id',
          fileName: 'videoId/id.jpg',
          uploadUrl: 'presignedUrl',
          userId: 'userId',
          publicUrl: 'https://assets.jesusfilm.org/videoId/id.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
          videoId: 'videoId'
        })
        const result = await authClient({
          document: VIDEO_CLOUDFLARE_ASSETS_MUTATION,
          variables: {
            input: {
              id: 'id',
              fileName: 'test.jpg',
              contentType: 'image/jpeg',
              videoId: 'videoId'
            }
          }
        })
        expect(prismaMock.cloudflareR2.create).toHaveBeenCalledWith({
          data: {
            id: 'id',
            fileName: 'videoId/id.jpg',
            uploadUrl: 'presignedUrl',
            userId: 'testUserId',
            publicUrl: 'https://assets.jesusfilm.org/videoId/id.jpg'
          }
        })
        expect(result).toHaveProperty('data.cloudflareR2Create.id', 'id')
        expect(result).toHaveProperty(
          'data.cloudflareR2Create.userId',
          'userId'
        )
        expect(result).toHaveProperty(
          'data.cloudflareR2Create.fileName',
          'videoId/id.jpg'
        )
        expect(result).toHaveProperty(
          'data.cloudflareR2Create.uploadUrl',
          'presignedUrl'
        )
        expect(result).toHaveProperty(
          'data.cloudflareR2Create.publicUrl',
          'https://assets.jesusfilm.org/videoId/id.jpg'
        )
      })

      it('should fail if video not found', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.video.findUnique.mockResolvedValue(null)

        const result = await authClient({
          document: VIDEO_CLOUDFLARE_ASSETS_MUTATION,
          variables: {
            input: {
              id: 'id',
              fileName: 'test.jpg',
              contentType: 'image/jpeg',
              videoId: 'videoId'
            }
          }
        })
        expect(result).toHaveProperty('data', null)
      })

      it('should fail if not publisher', async () => {
        const result = await client({
          document: VIDEO_CLOUDFLARE_ASSETS_MUTATION,
          variables: {
            input: {
              id: 'id',
              fileName: 'fileName',
              videoId: 'videoId',
              contentType: 'video/mp4'
            }
          }
        })
        expect(result).toHaveProperty('data', null)
      })
    })

    describe('cloudflareR2Delete', () => {
      const VIDEO_CLOUDFLARE_ASSETS_MUTATION = graphql(`
        mutation VideoCloudflareAssetsDelete($id: ID!) {
          cloudflareR2Delete(id: $id) {
            id
            fileName
            uploadUrl
            userId
            publicUrl
            createdAt
            updatedAt
          }
        }
      `)

      it('should delete a r2 asset', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.cloudflareR2.delete.mockResolvedValue({
          id: 'id',
          fileName: 'fileName',
          uploadUrl: 'presignedUrl',
          userId: 'testUserId',
          publicUrl: 'https://assets.jesusfilm.org/fileName',
          createdAt: new Date(),
          updatedAt: new Date(),
          videoId: 'videoId'
        })
        const result = await authClient({
          document: VIDEO_CLOUDFLARE_ASSETS_MUTATION,
          variables: {
            id: 'id'
          }
        })
        expect(prismaMock.cloudflareR2.delete).toHaveBeenCalledWith({
          where: { id: 'id' }
        })
        expect(result).toHaveProperty('data.cloudflareR2Delete.id', 'id')
        expect(result).toHaveProperty(
          'data.cloudflareR2Delete.userId',
          'testUserId'
        )
        expect(result).toHaveProperty(
          'data.cloudflareR2Delete.fileName',
          'fileName'
        )
        expect(result).toHaveProperty(
          'data.cloudflareR2Delete.uploadUrl',
          'presignedUrl'
        )
        expect(result).toHaveProperty(
          'data.cloudflareR2Delete.publicUrl',
          'https://assets.jesusfilm.org/fileName'
        )
      })

      it('should fail if not publisher', async () => {
        const result = await client({
          document: VIDEO_CLOUDFLARE_ASSETS_MUTATION,
          variables: {
            id: 'id'
          }
        })
        expect(result).toHaveProperty('data', null)
      })
    })
  })
})
