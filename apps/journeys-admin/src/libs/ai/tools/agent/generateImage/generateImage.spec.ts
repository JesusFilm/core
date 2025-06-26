import { openai } from '@ai-sdk/openai'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { experimental_generateImage } from 'ai'
import { z } from 'zod'

import { agentGenerateImage } from './generateImage'
import { upload } from './upload'

jest.mock('@ai-sdk/openai', () => ({
  openai: {
    image: jest.fn().mockReturnValue('mocked-dalle-3-model')
  }
}))

jest.mock('ai', () => ({
  ...jest.requireActual('ai'),
  experimental_generateImage: jest.fn()
}))

jest.mock('./upload', () => ({
  upload: jest.fn()
}))

describe('agentGenerateImage', () => {
  let mockClient: ApolloClient<NormalizedCacheObject>
  const mockToolOptions = { langfuseTraceId: 'test-trace-id-123' }

  const mockOpenaiImage = openai.image as jest.MockedFunction<
    typeof openai.image
  >
  const mockExperimentalGenerateImage =
    experimental_generateImage as jest.MockedFunction<
      typeof experimental_generateImage
    >
  const mockUpload = upload as jest.MockedFunction<typeof upload>

  beforeEach(() => {
    mockClient = {
      mutate: jest.fn(),
      query: jest.fn()
    } as unknown as ApolloClient<NormalizedCacheObject>

    jest.clearAllMocks()
  })

  describe('Tool Structure & Parameter Validation', () => {
    it('should return tool with correct structure and validate parameters', () => {
      const tool = agentGenerateImage(mockClient, mockToolOptions)

      expect(tool.description).toBe('Generate an image')
      expect(tool.parameters).toBeInstanceOf(z.ZodObject)

      const parametersShape = tool.parameters.shape as {
        prompt: z.ZodTypeAny
        n: z.ZodTypeAny
      }

      expect(parametersShape.prompt).toBeInstanceOf(z.ZodString)
      expect(parametersShape.prompt.description).toBe(
        'The prompt to generate the image from'
      )

      expect(parametersShape.n).toBeInstanceOf(z.ZodDefault)
      expect(parametersShape.n.description).toBe(
        'The number of images to generate. Should be 1 unless you want to provide an array of images for the user to select from.'
      )

      expect(() =>
        tool.parameters.parse({
          prompt: 'test prompt',
          n: 2
        })
      ).not.toThrow()

      expect(() =>
        tool.parameters.parse({
          prompt: 'test prompt'
        })
      ).not.toThrow()

      const parsed = tool.parameters.parse({ prompt: 'test prompt' })
      expect(parsed.n).toBe(1)

      expect(() =>
        tool.parameters.parse({
          n: 2 // missing required prompt
        })
      ).toThrow()

      expect(() =>
        tool.parameters.parse({
          prompt: 123 // invalid type
        })
      ).toThrow()
    })
  })

  describe('Successful Single Image Generation', () => {
    it('should generate single image and handle all integration points', async () => {
      const mockGeneratedImages = {
        images: [{ uint8Array: new Uint8Array([1, 2, 3, 4]) }]
      } as any

      const mockUploadResult = {
        success: true as const,
        src: 'https://imagedelivery.net/test-key/test-id/public'
      }

      mockExperimentalGenerateImage.mockResolvedValue(mockGeneratedImages)
      mockUpload.mockResolvedValue(mockUploadResult)

      const tool = agentGenerateImage(mockClient, mockToolOptions)
      const result = await tool.execute(
        { prompt: 'test prompt', n: 1 },
        { toolCallId: 'test-call-id', messages: [] }
      )

      expect(mockOpenaiImage).toHaveBeenCalledWith('dall-e-3')
      expect(mockExperimentalGenerateImage).toHaveBeenCalledWith({
        model: 'mocked-dalle-3-model',
        prompt: 'test prompt',
        n: 1
      })

      expect(mockUpload).toHaveBeenCalledTimes(1)
      expect(mockUpload).toHaveBeenCalledWith(
        mockClient,
        new Uint8Array([1, 2, 3, 4])
      )

      expect(result).toEqual([mockUploadResult])
    })
  })

  describe('Successful Multiple Image Generation', () => {
    it('should generate multiple images and handle Promise.all correctly', async () => {
      const mockGeneratedImages = {
        images: [
          { uint8Array: new Uint8Array([1, 2, 3, 4]) },
          { uint8Array: new Uint8Array([5, 6, 7, 8]) },
          { uint8Array: new Uint8Array([9, 10, 11, 12]) }
        ]
      } as any

      const mockUploadResults = [
        {
          success: true as const,
          src: 'https://imagedelivery.net/test-key/test-id-1/public'
        },
        {
          success: true as const,
          src: 'https://imagedelivery.net/test-key/test-id-2/public'
        },
        {
          success: true as const,
          src: 'https://imagedelivery.net/test-key/test-id-3/public'
        }
      ]

      mockExperimentalGenerateImage.mockResolvedValue(mockGeneratedImages)
      mockUpload
        .mockResolvedValueOnce(mockUploadResults[0])
        .mockResolvedValueOnce(mockUploadResults[1])
        .mockResolvedValueOnce(mockUploadResults[2])

      const tool = agentGenerateImage(mockClient, mockToolOptions)
      const result = await tool.execute(
        { prompt: 'test prompt', n: 3 },
        { toolCallId: 'test-call-id', messages: [] }
      )

      expect(mockExperimentalGenerateImage).toHaveBeenCalledWith({
        model: 'mocked-dalle-3-model',
        prompt: 'test prompt',
        n: 3
      })

      expect(mockUpload).toHaveBeenCalledTimes(3)
      expect(mockUpload).toHaveBeenNthCalledWith(
        1,
        mockClient,
        new Uint8Array([1, 2, 3, 4])
      )
      expect(mockUpload).toHaveBeenNthCalledWith(
        2,
        mockClient,
        new Uint8Array([5, 6, 7, 8])
      )
      expect(mockUpload).toHaveBeenNthCalledWith(
        3,
        mockClient,
        new Uint8Array([9, 10, 11, 12])
      )

      expect(result).toEqual(mockUploadResults)
    })
  })

  describe('AI SDK Error Handling', () => {
    it('should handle experimental_generateImage failures', async () => {
      const mockError = new Error('OpenAI API error')
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(jest.fn())

      mockExperimentalGenerateImage.mockRejectedValue(mockError)

      const tool = agentGenerateImage(mockClient, mockToolOptions)
      const result = await tool.execute(
        { prompt: 'test prompt', n: 1 },
        { toolCallId: 'test-call-id', messages: [] }
      )

      expect(consoleErrorSpy).toHaveBeenCalledWith(mockError)
      expect(result).toBe(`Error generating image: ${mockError}`)

      expect(mockExperimentalGenerateImage).toHaveBeenCalledWith({
        model: 'mocked-dalle-3-model',
        prompt: 'test prompt',
        n: 1
      })

      expect(mockUpload).not.toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Upload Error Handling', () => {
    it('should handle upload failures in Promise.all', async () => {
      const mockGeneratedImages = {
        images: [
          { uint8Array: new Uint8Array([1, 2, 3, 4]) },
          { uint8Array: new Uint8Array([5, 6, 7, 8]) }
        ]
      } as any

      const mockUploadError = new Error('Upload failed')
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(jest.fn())

      mockExperimentalGenerateImage.mockResolvedValue(mockGeneratedImages)
      mockUpload
        .mockResolvedValueOnce({
          success: true as const,
          src: 'https://test1.com'
        })
        .mockRejectedValueOnce(mockUploadError)

      const tool = agentGenerateImage(mockClient, mockToolOptions)
      const result = await tool.execute(
        { prompt: 'test prompt', n: 2 },
        { toolCallId: 'test-call-id', messages: [] }
      )

      expect(consoleErrorSpy).toHaveBeenCalledWith(mockUploadError)
      expect(result).toBe(`Error generating image: ${mockUploadError}`)

      expect(mockExperimentalGenerateImage).toHaveBeenCalledWith({
        model: 'mocked-dalle-3-model',
        prompt: 'test prompt',
        n: 2
      })

      expect(mockUpload).toHaveBeenCalledTimes(2)

      consoleErrorSpy.mockRestore()
    })
  })
})
