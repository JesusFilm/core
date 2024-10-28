import { graphql } from 'gql.tada'

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

  describe('queries', () => {
    const VIDEO_CLOUDFLARE_ASSETS_QUERY = graphql(`
      query videoCloudflareAssets(videoId: ID!) {
        videoCloudflareAssets(videoId: $videoId) {
          id
          uploadUrl
          userId
          publicUrl
          createdAt
          updatedAt
        }
      }
    `)

    it('should query r2 assets', async () => {
      prismaMock.userMediaRole.findUnique.mockResolvedValue({
        id: 'userId',
        userId: 'userId',
        roles: ['publisher']
      })
      prismaMock.cloudflareR2.findMany.mockResolvedValueOnce([
        {
          id: 'id',
          fileName: 'fileName',
          userId: 'userId',
          uploadUrl: 'uploadUrl',
          publicUrl: `${process.env.CLOUDFLARE_R2_CUSTOM_DOMAIN}/fileName`,
          createdAt: new Date(),
          updatedAt: new Date(),
          videoId: 'videoId'
        }
      ])
      const data = await authClient({
        document: VIDEO_CLOUDFLARE_ASSETS_QUERY,
        variables: {
          videoId: 'videoId'
        }
      })
      expect(prismaMock.cloudflareR2.findMany).toHaveBeenCalledWith({
        where: { videoId: 'videoId' }
      })
      expect(data).toHaveProperty('data.videoCloudflareAssets', [
        {
          id: 'id',
          uploadUrl: 'uploadUrl',
          userId: 'userId',
          publicUrl: `process.env.CLOUDFLARE_R2_CUSTOM_DOMAIN/id`,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ])
    })
  })
})
