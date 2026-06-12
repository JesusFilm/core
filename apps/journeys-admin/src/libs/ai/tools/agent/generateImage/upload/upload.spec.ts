import { ApolloClient, NormalizedCacheObject } from '@apollo/client'

import { AiCreateCloudflareUploadByFileMutation } from '../../../../../../../__generated__/AiCreateCloudflareUploadByFileMutation'

import { AI_CREATE_CLOUDFLARE_UPLOAD_BY_FILE, upload } from './upload'

describe('upload', () => {
  let mockClient: ApolloClient<NormalizedCacheObject>
  const originalFetch = global.fetch
  const originalEnv = process.env.NEXT_PUBLIC_CLOUDFLARE_UPLOAD_KEY

  beforeEach(() => {
    mockClient = {
      mutate: jest.fn()
    } as unknown as ApolloClient<NormalizedCacheObject>

    global.fetch = jest.fn()
    process.env.NEXT_PUBLIC_CLOUDFLARE_UPLOAD_KEY = 'test-cloudflare-key'
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  afterAll(() => {
    global.fetch = originalFetch
    process.env.NEXT_PUBLIC_CLOUDFLARE_UPLOAD_KEY = originalEnv
  })

  describe('Successful Upload Flow Tests', () => {
    it('should successfully upload Uint8Array and return success response', async () => {
      const mockMutationResponse: {
        data: AiCreateCloudflareUploadByFileMutation
      } = {
        data: {
          createCloudflareUploadByFile: {
            __typename: 'CloudflareImage',
            id: 'test-upload-id',
            uploadUrl: 'https://api.cloudflare.com/test-upload-url'
          }
        }
      }

      const mockFetchResponse = {
        ok: true
      }

      ;(mockClient.mutate as jest.Mock).mockResolvedValue(mockMutationResponse)
      ;(global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse)

      const testUint8Array = new Uint8Array([1, 2, 3, 4])
      const result = await upload(mockClient, testUint8Array)

      expect(mockClient.mutate).toHaveBeenCalledWith({
        mutation: AI_CREATE_CLOUDFLARE_UPLOAD_BY_FILE
      })

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.cloudflare.com/test-upload-url',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData)
        })
      )

      expect(result).toEqual({
        src: 'https://imagedelivery.net/test-cloudflare-key/test-upload-id/public',
        success: true
      })
    })

    it('should call Apollo Client mutation with correct parameters', async () => {
      const mockMutationResponse: {
        data: AiCreateCloudflareUploadByFileMutation
      } = {
        data: {
          createCloudflareUploadByFile: {
            __typename: 'CloudflareImage',
            id: 'test-upload-id-2',
            uploadUrl: 'https://api.cloudflare.com/test-upload-url-2'
          }
        }
      }

      const mockFetchResponse = {
        ok: true
      }

      ;(mockClient.mutate as jest.Mock).mockResolvedValue(mockMutationResponse)
      ;(global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse)

      const testUint8Array = new Uint8Array([5, 6, 7, 8])
      await upload(mockClient, testUint8Array)

      expect(mockClient.mutate).toHaveBeenCalledTimes(1)
      expect(mockClient.mutate).toHaveBeenCalledWith({
        mutation: AI_CREATE_CLOUDFLARE_UPLOAD_BY_FILE
      })
    })

    it('should create FormData with Uint8Array blob', async () => {
      const mockMutationResponse: {
        data: AiCreateCloudflareUploadByFileMutation
      } = {
        data: {
          createCloudflareUploadByFile: {
            __typename: 'CloudflareImage',
            id: 'test-upload-id-3',
            uploadUrl: 'https://api.cloudflare.com/test-upload-url-3'
          }
        }
      }

      const mockFetchResponse = {
        ok: true
      }

      ;(mockClient.mutate as jest.Mock).mockResolvedValue(mockMutationResponse)
      ;(global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse)

      const testUint8Array = new Uint8Array([9, 10, 11, 12])
      await upload(mockClient, testUint8Array)

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0]
      const [url, options] = fetchCall
      const formData = options.body

      expect(formData).toBeInstanceOf(FormData)
      expect(url).toBe('https://api.cloudflare.com/test-upload-url-3')
      expect(options.method).toBe('POST')

      const fileEntry = formData.get('file')
      expect(fileEntry).toBeInstanceOf(Blob)

      if (fileEntry instanceof Blob) {
        expect(fileEntry.size).toBe(testUint8Array.length)

        // Verify actual byte content matches input
        const arrayBuffer = await fileEntry.arrayBuffer()
        const resultUint8Array = new Uint8Array(arrayBuffer)
        expect(resultUint8Array).toEqual(testUint8Array)
      }
    })

    it('should make fetch request with correct upload URL and method', async () => {
      const testUploadUrl =
        'https://custom.cloudflare.com/unique-upload-endpoint'
      const mockMutationResponse: {
        data: AiCreateCloudflareUploadByFileMutation
      } = {
        data: {
          createCloudflareUploadByFile: {
            __typename: 'CloudflareImage',
            id: 'test-upload-id-4',
            uploadUrl: testUploadUrl
          }
        }
      }

      const mockFetchResponse = {
        ok: true
      }

      ;(mockClient.mutate as jest.Mock).mockResolvedValue(mockMutationResponse)
      ;(global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse)

      const testUint8Array = new Uint8Array([13, 14, 15, 16])
      await upload(mockClient, testUint8Array)

      expect(global.fetch).toHaveBeenCalledWith(
        testUploadUrl,
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData)
        })
      )
    })

    it('should return correct src using environment variable and id', async () => {
      const testId = 'unique-cloudflare-id'
      const mockMutationResponse: {
        data: AiCreateCloudflareUploadByFileMutation
      } = {
        data: {
          createCloudflareUploadByFile: {
            __typename: 'CloudflareImage',
            id: testId,
            uploadUrl: 'https://api.cloudflare.com/test-upload-url-5'
          }
        }
      }

      const mockFetchResponse = {
        ok: true
      }

      ;(mockClient.mutate as jest.Mock).mockResolvedValue(mockMutationResponse)
      ;(global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse)

      const testUint8Array = new Uint8Array([17, 18, 19, 20])
      const result = await upload(mockClient, testUint8Array)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.src).toBe(
          `https://imagedelivery.net/${process.env.NEXT_PUBLIC_CLOUDFLARE_UPLOAD_KEY}/${testId}/public`
        )
      }
    })
  })

  describe('Apollo Client Error Tests', () => {
    it('should handle Apollo Client mutation failure', async () => {
      const mockError = new Error('GraphQL network error')
      ;(mockClient.mutate as jest.Mock).mockRejectedValue(mockError)

      const testUint8Array = new Uint8Array([1, 2, 3, 4])
      const result = await upload(mockClient, testUint8Array)
      expect(result).toEqual({
        errorMessage: mockError.message,
        success: false
      })

      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('should handle missing/null uploadUrl in response', async () => {
      const mockMutationResponse: {
        data: AiCreateCloudflareUploadByFileMutation
      } = {
        data: {
          createCloudflareUploadByFile: {
            __typename: 'CloudflareImage',
            id: 'test-id',
            uploadUrl: null
          }
        }
      }

      const mockError = new Error('Failed to get upload URL')

      ;(mockClient.mutate as jest.Mock).mockResolvedValue(mockMutationResponse)

      const testUint8Array = new Uint8Array([5, 6, 7, 8])
      const result = await upload(mockClient, testUint8Array)

      expect(mockClient.mutate).toHaveBeenCalledWith({
        mutation: AI_CREATE_CLOUDFLARE_UPLOAD_BY_FILE
      })

      expect(result).toEqual({
        errorMessage: mockError.message,
        success: false
      })

      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  describe('Fetch/Upload Error Tests', () => {
    it('should handle fetch network errors', async () => {
      const mockMutationResponse: {
        data: AiCreateCloudflareUploadByFileMutation
      } = {
        data: {
          createCloudflareUploadByFile: {
            __typename: 'CloudflareImage',
            id: 'test-upload-id',
            uploadUrl: 'https://api.cloudflare.com/test-upload-url'
          }
        }
      }

      const mockError = new Error('Network connection failed')

      ;(mockClient.mutate as jest.Mock).mockResolvedValue(mockMutationResponse)
      ;(global.fetch as jest.Mock).mockRejectedValue(mockError)

      const testUint8Array = new Uint8Array([1, 2, 3, 4])
      const result = await upload(mockClient, testUint8Array)

      expect(mockClient.mutate).toHaveBeenCalledWith({
        mutation: AI_CREATE_CLOUDFLARE_UPLOAD_BY_FILE
      })

      expect(result).toEqual({
        errorMessage: mockError.message,
        success: false
      })
    })

    it('should handle non-ok fetch responses (404, 500, etc.)', async () => {
      const mockMutationResponse: {
        data: AiCreateCloudflareUploadByFileMutation
      } = {
        data: {
          createCloudflareUploadByFile: {
            __typename: 'CloudflareImage',
            id: 'test-upload-id-2',
            uploadUrl: 'https://api.cloudflare.com/test-upload-url-2'
          }
        }
      }

      const mockFetchResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      }

      const mockError = new Error('Failed to upload image to Cloudflare')

      ;(mockClient.mutate as jest.Mock).mockResolvedValue(mockMutationResponse)
      ;(global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse)

      const testUint8Array = new Uint8Array([5, 6, 7, 8])
      const result = await upload(mockClient, testUint8Array)

      expect(mockClient.mutate).toHaveBeenCalledWith({
        mutation: AI_CREATE_CLOUDFLARE_UPLOAD_BY_FILE
      })

      expect(result).toEqual({
        errorMessage: mockError.message,
        success: false
      })
    })

    it('should handle non-Error exceptions and use fallback error message', async () => {
      const mockMutationResponse: {
        data: AiCreateCloudflareUploadByFileMutation
      } = {
        data: {
          createCloudflareUploadByFile: {
            __typename: 'CloudflareImage',
            id: 'test-upload-id-3',
            uploadUrl: 'https://api.cloudflare.com/test-upload-url-3'
          }
        }
      }

      const mockNonErrorException = 'Network timeout'

      ;(mockClient.mutate as jest.Mock).mockResolvedValue(mockMutationResponse)
      ;(global.fetch as jest.Mock).mockRejectedValue(mockNonErrorException)

      const testUint8Array = new Uint8Array([9, 10, 11, 12])
      const result = await upload(mockClient, testUint8Array)

      expect(result).toEqual({
        errorMessage: 'Failed to upload image to Cloudflare',
        success: false
      })
    })
  })
})
