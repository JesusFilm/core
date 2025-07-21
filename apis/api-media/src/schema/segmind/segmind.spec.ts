import { graphql } from '@core/shared/gql'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import {
  createImageFromResponse,
  createImageFromText
} from '../cloudflare/image/service'

import { SegmindModelEnum } from './enums/segmindModel'

const mockCreateImageFromText = createImageFromText as jest.Mock
const mockCreateImageFromResponse = createImageFromResponse as jest.Mock

jest.mock('../cloudflare/image/service', () => ({
  __esModule: true,
  createImageFromResponse: jest.fn(),
  createImageFromText: jest.fn()
}))

describe('segmind', () => {
  const client = getClient()

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
      const response = new Response()
      mockCreateImageFromText.mockResolvedValue(response)
      mockCreateImageFromResponse.mockResolvedValue({ id: 'id' })
      prismaMock.cloudflareImage.create.mockResolvedValue({
        id: 'id',
        uploaded: true,
        userId: 'testUserId',
        uploadUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        aspectRatio: null,
        videoId: null
      })
      const result = await client({
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
      expect(prismaMock.cloudflareImage.create).toHaveBeenCalledWith({
        data: {
          id: 'id',
          uploaded: true,
          userId: 'testUserId'
        }
      })
    })
  })
})
