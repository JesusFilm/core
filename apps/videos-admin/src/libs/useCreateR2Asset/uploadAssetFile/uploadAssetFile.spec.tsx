import { uploadAssetFile } from './uploadAssetFile'

const originalFetch = global.fetch
global.fetch = jest.fn()

describe('uploadAssetFile', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    global.fetch = originalFetch
  })

  it('should successfully upload a file', async () => {
    const mockResponse = {
      ok: true
    }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse)

    const mockFile = new File(['test content'], 'test.vtt', {
      type: 'text/vtt'
    })
    const mockUploadUrl = 'https://example.com/upload'

    await expect(
      uploadAssetFile(mockFile, mockUploadUrl)
    ).resolves.not.toThrow()

    expect(global.fetch).toHaveBeenCalledWith(mockUploadUrl, {
      method: 'PUT',
      body: mockFile,
      headers: { 'Content-Type': 'text/vtt' }
    })
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('should throw an error when upload fails', async () => {
    const mockResponse = {
      ok: false
    }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse)

    const mockFile = new File(['test content'], 'test.vtt', {
      type: 'text/vtt'
    })
    const mockUploadUrl = 'https://example.com/upload'

    await expect(uploadAssetFile(mockFile, mockUploadUrl)).rejects.toThrow(
      'Failed to upload subtitle file.'
    )

    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('should handle network errors', async () => {
    const networkError = new Error('Network error')
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(networkError)

    const mockFile = new File(['test content'], 'test.vtt', {
      type: 'text/vtt'
    })
    const mockUploadUrl = 'https://example.com/upload'

    await expect(uploadAssetFile(mockFile, mockUploadUrl)).rejects.toThrow(
      'Network error'
    )

    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('should use the file type in the Content-Type header', async () => {
    const mockResponse = {
      ok: true
    }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse)

    const mockFile = new File(['test content'], 'test.srt', {
      type: 'application/x-subrip'
    })
    const mockUploadUrl = 'https://example.com/upload'

    await uploadAssetFile(mockFile, mockUploadUrl)

    expect(global.fetch).toHaveBeenCalledWith(
      mockUploadUrl,
      expect.objectContaining({
        headers: { 'Content-Type': 'application/x-subrip' }
      })
    )
  })
})
