import { type Mock, vi } from 'vitest'

import { graphql } from '@core/shared/gql'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { createImageFromText } from '../cloudflare/image/service'

import { SegmindModelEnum } from './enums/segmindModel'

const mockCreateImageFromText = createImageFromText as Mock

vi.mock('../cloudflare/image/service', () => ({
  __esModule: true,
  createImageFromText: vi.fn()
}))

describe('segmind', () => {
  const authClient = getClient({
    headers: {
      authorization: 'token'
    },
    context: {
      currentUser: {
        id: 'userId'
      }
    }
  })

  describe('createImageBySegmindPrompt', () => {
    const CREATE_IMAGE_BY_SEGMIND_PROMPT_MUTATION = graphql(`
      mutation CreateImageBySegmindPrompt(
        $prompt: String!
        $model: SegmindModel!
      ) {
        createImageBySegmindPrompt(prompt: $prompt, model: $model) {
          id
          uploadUrl
          userId
        }
      }
    `)

    it('should return cloudflare image', async () => {
      mockCreateImageFromText.mockResolvedValue({ id: 'id' })
      prismaMock.cloudflareImage.create.mockResolvedValue({
        id: 'id',
        uploaded: true,
        userId: 'testUserId',
        uploadUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        aspectRatio: null,
        videoId: null,
        blurhash: null,
        blurhashAttemptedAt: null,
        teamId: null,
        isAi: true
      })
      const result = await authClient({
        document: CREATE_IMAGE_BY_SEGMIND_PROMPT_MUTATION,
        variables: {
          prompt: 'test prompt',
          model: SegmindModelEnum.sdxl1__0_txt2img
        }
      })
      expect(result).toEqual({
        data: {
          createImageBySegmindPrompt: {
            id: 'id',
            uploadUrl: null,
            userId: 'testUserId'
          }
        }
      })
      expect(mockCreateImageFromText).toHaveBeenCalledWith('test prompt')
      expect(prismaMock.cloudflareImage.create).toHaveBeenCalledWith({
        data: {
          id: 'id',
          uploaded: true,
          userId: 'testUserId',
          isAi: true
        }
      })
    })
  })
})
