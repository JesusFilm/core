import { graphql } from 'gql.tada'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'

describe('videoSubtitle', () => {
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
    describe('createVideoSubtitle', () => {
      const CREATE_VIDEO_SUBTITLE_MUTATION = graphql(`
        mutation CreateVideoSubtitle($input: VideoSubtitleCreateInput!) {
          createVideoSubtitle(input: $input) {
            id
          }
        }
      `)

      it('should create video subtitle', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.videoSubtitle.create.mockResolvedValue({
          id: 'id',
          edition: 'edition',
          videoId: 'videoId',
          vttSrc: 'vttSrc',
          srtSrc: 'srtSrc',
          primary: true,
          languageId: 'languageId'
        })
        const result = await authClient({
          document: CREATE_VIDEO_SUBTITLE_MUTATION,
          variables: {
            input: {
              id: 'id',
              edition: 'edition',
              videoId: 'videoId',
              vttSrc: 'vttSrc',
              srtSrc: 'srtSrc',
              primary: true,
              languageId: '529'
            }
          }
        })
        expect(result).toHaveProperty('data.createVideoSubtitle', {
          id: 'id'
        })
      })

      it('should reject if not publisher', async () => {
        const result = await client({
          document: CREATE_VIDEO_SUBTITLE_MUTATION,
          variables: {
            input: {
              id: 'id',
              edition: 'edition',
              videoId: 'videoId',
              vttSrc: 'vttSrc',
              srtSrc: 'srtSrc',
              primary: true,
              languageId: 'languageId'
            }
          }
        })
        expect(result).toHaveProperty('data', null)
      })
    })
  })
})
