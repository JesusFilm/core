import { handleVttFile } from './handleVttFile'

describe('handleVttFile', () => {
  // Mock dependencies
  const mockVideo = { id: 'video-123' } as any
  const mockFile = new File(['test content'], 'test.vtt', { type: 'text/vtt' })
  const mockAbortController = { current: new AbortController() } as any

  const mockUploadUrl = 'https://example.com/upload'
  const mockPublicUrl = 'https://example.com/public/test.vtt'

  const mockCreateR2Asset = jest.fn().mockResolvedValue({
    data: {
      cloudflareR2Create: {
        uploadUrl: mockUploadUrl,
        publicUrl: mockPublicUrl
      }
    }
  })

  const mockUploadAssetFile = jest.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should upload a VTT file and return the public URL, upload URL, and r2AssetId', async () => {
    const result = await handleVttFile({
      vttFile: mockFile,
      videoId: 'video-123',
      editionId: 'edition-123',
      languageId: 'language-123',
      createR2Asset: mockCreateR2Asset,
      uploadAssetFile: mockUploadAssetFile,
      abortController: mockAbortController,
      errorMessage: 'some error'
    })

    expect(mockCreateR2Asset).toHaveBeenCalledWith({
      variables: {
        input: {
          videoId: mockVideo.id,
          fileName: expect.any(String),
          originalFilename: mockFile.name,
          contentType: mockFile.type,
          contentLength: mockFile.size.toString()
        }
      },
      context: {
        fetchOptions: {
          signal: mockAbortController.current?.signal
        }
      }
    })

    expect(mockUploadAssetFile).toHaveBeenCalledWith(mockFile, mockUploadUrl)

    expect(result).toStrictEqual({
      publicUrl: 'https://example.com/public/test.vtt',
      r2AssetId: undefined,
      uploadUrl: 'https://example.com/upload'
    })
  })

  it('should throw an error if cloudflareR2Create returns no uploadUrl', async () => {
    mockCreateR2Asset.mockResolvedValueOnce({
      data: {
        cloudflareR2Create: {
          uploadUrl: null,
          publicUrl: null
        }
      }
    })

    await expect(
      handleVttFile({
        vttFile: mockFile,
        videoId: 'video-123',
        editionId: 'edition-123',
        languageId: 'language-123',
        createR2Asset: mockCreateR2Asset,
        uploadAssetFile: mockUploadAssetFile,
        abortController: mockAbortController,
        errorMessage: 'Failed to create r2 asset for VTT file.'
      })
    ).rejects.toThrow('Failed to create r2 asset for VTT file.')

    expect(mockUploadAssetFile).not.toHaveBeenCalled()
  })
})
