import { act, renderHook } from '@testing-library/react'
import { ErrorCode, useDropzone } from 'react-dropzone'

import { useCloudflareUploadByFileMutation } from '../useCloudflareUploadByFileMutation'

import { useImageUpload } from './useImageUpload'

jest.mock('react-dropzone', () => ({
  ...jest.requireActual('react-dropzone'),
  useDropzone: jest.fn()
}))

jest.mock('../useCloudflareUploadByFileMutation', () => ({
  useCloudflareUploadByFileMutation: jest.fn()
}))

const mockUseDropzone = useDropzone as jest.MockedFunction<typeof useDropzone>
const mockUseCloudflareUploadByFileMutation =
  useCloudflareUploadByFileMutation as jest.MockedFunction<
    typeof useCloudflareUploadByFileMutation
  >

describe('useImageUpload', () => {
  let originalEnv: NodeJS.ProcessEnv
  const onUploadComplete = jest.fn()
  const onUploadStart = jest.fn()
  const onUploadError = jest.fn()
  const originalFetch = global.fetch

  beforeEach(() => {
    originalEnv = process.env
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_CLOUDFLARE_UPLOAD_KEY: 'cloudflare-key'
    }
    jest.clearAllMocks()
    global.fetch = jest.fn()
    mockUseDropzone.mockReturnValue({
      getRootProps: jest.fn(),
      getInputProps: jest.fn(),
      open: jest.fn(),
      isDragActive: false,
      isDragAccept: false,
      isDragReject: false,
      acceptedFiles: [],
      fileRejections: []
    } as any)
    mockUseCloudflareUploadByFileMutation.mockReturnValue([jest.fn()] as any)
  })

  afterEach(() => {
    process.env = originalEnv
    global.fetch = originalFetch
  })

  const getMockFetch = (): jest.Mock => global.fetch as jest.Mock

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useImageUpload({ onUploadComplete }))

    expect(result.current.loading).toBe(false)
    expect(result.current.success).toBeUndefined()
    expect(result.current.errorCode).toBeUndefined()
  })

  it('should reset state', async () => {
    const createCloudflareUploadByFile = jest.fn().mockResolvedValue({
      data: {
        createCloudflareUploadByFile: {
          uploadUrl: 'https://upload.url'
        }
      }
    })
    mockUseCloudflareUploadByFileMutation.mockReturnValue([
      createCloudflareUploadByFile
    ] as any)

    getMockFetch().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: false,
        errors: [{ code: 5000, message: 'Upload failed' }]
      })
    })

    const { result } = renderHook(() => useImageUpload({ onUploadComplete }))

    const onDrop = mockUseDropzone.mock.calls[0][0]?.onDrop
    const file = new File(['file'], 'test.png', { type: 'image/png' })

    await act(async () => {
      await onDrop?.([file], [], {} as any)
    })

    expect(result.current.success).toBe(false)
    expect(result.current.errorCode).toBe(5000)

    act(() => {
      result.current.resetState()
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.success).toBeUndefined()
    expect(result.current.errorCode).toBeUndefined()
  })

  it('should handle successful upload', async () => {
    const createCloudflareUploadByFile = jest.fn().mockResolvedValue({
      data: {
        createCloudflareUploadByFile: {
          uploadUrl: 'https://upload.url'
        }
      }
    })
    mockUseCloudflareUploadByFileMutation.mockReturnValue([
      createCloudflareUploadByFile
    ] as any)

    getMockFetch().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        result: { id: 'image-id' }
      })
    })

    renderHook(() => useImageUpload({ onUploadComplete, onUploadStart }))

    const onDrop = mockUseDropzone.mock.calls[0][0]?.onDrop
    const file = new File(['file'], 'test.png', { type: 'image/png' })

    await act(async () => {
      await onDrop?.([file], [], {} as any)
    })

    expect(onUploadStart).toHaveBeenCalled()
    expect(createCloudflareUploadByFile).toHaveBeenCalled()
    expect(getMockFetch()).toHaveBeenCalledWith(
      'https://upload.url',
      expect.any(Object)
    )
    expect(onUploadComplete).toHaveBeenCalledWith(
      'https://imagedelivery.net/cloudflare-key/image-id/public'
    )
  })

  it('should handle rejected files', async () => {
    renderHook(() => useImageUpload({ onUploadComplete, onUploadError }))

    const onDrop = mockUseDropzone.mock.calls[0][0]?.onDrop
    const fileRejection = {
      file: new File([''], 'large.png'),
      errors: [{ code: ErrorCode.FileTooLarge, message: 'Too large' }]
    }

    await act(async () => {
      await onDrop?.([], [fileRejection] as any, {} as any)
    })

    expect(onUploadError).toHaveBeenCalledWith(ErrorCode.FileTooLarge)
  })

  it('should handle Cloudflare error response', async () => {
    const createCloudflareUploadByFile = jest.fn().mockResolvedValue({
      data: {
        createCloudflareUploadByFile: {
          uploadUrl: 'https://upload.url'
        }
      }
    })
    mockUseCloudflareUploadByFileMutation.mockReturnValue([
      createCloudflareUploadByFile
    ] as any)

    getMockFetch().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: false,
        errors: [{ code: 5000, message: 'Upload failed' }]
      })
    })

    const { result } = renderHook(() =>
      useImageUpload({ onUploadComplete, onUploadError })
    )

    const onDrop = mockUseDropzone.mock.calls[0][0]?.onDrop
    const file = new File(['file'], 'test.png', { type: 'image/png' })

    await act(async () => {
      await onDrop?.([file], [], {} as any)
    })

    expect(onUploadError).toHaveBeenCalledWith(5000)
    expect(result.current.errorCode).toBe(5000)
  })

  it('should handle numeric Cloudflare error code', async () => {
    const createCloudflareUploadByFile = jest.fn().mockResolvedValue({
      data: {
        createCloudflareUploadByFile: {
          uploadUrl: 'https://upload.url'
        }
      }
    })
    mockUseCloudflareUploadByFileMutation.mockReturnValue([
      createCloudflareUploadByFile
    ] as any)

    getMockFetch().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: false,
        errors: [{ code: 10003, message: 'Cloudflare error' }]
      })
    })

    const { result } = renderHook(() =>
      useImageUpload({ onUploadComplete, onUploadError })
    )

    const onDrop = mockUseDropzone.mock.calls[0][0]?.onDrop
    const file = new File(['file'], 'test.png', { type: 'image/png' })

    await act(async () => {
      await onDrop?.([file], [], {} as any)
    })

    expect(onUploadError).toHaveBeenCalledWith(10003)
    expect(result.current.errorCode).toBe(10003)
    expect(result.current.loading).toBe(false)
  })

  it('should handle fetch exception', async () => {
    const createCloudflareUploadByFile = jest.fn().mockResolvedValue({
      data: {
        createCloudflareUploadByFile: {
          uploadUrl: 'https://upload.url'
        }
      }
    })
    mockUseCloudflareUploadByFileMutation.mockReturnValue([
      createCloudflareUploadByFile
    ] as any)

    getMockFetch().mockRejectedValueOnce(new Error('Network error'))

    renderHook(() => useImageUpload({ onUploadComplete, onUploadError }))

    const onDrop = mockUseDropzone.mock.calls[0][0]?.onDrop
    const file = new File(['file'], 'test.png', { type: 'image/png' })

    await act(async () => {
      await onDrop?.([file], [], {} as any)
    })

    expect(onUploadError).toHaveBeenCalledWith('unknown-error')
  })

  it('should handle failed mutation', async () => {
    const createCloudflareUploadByFile = jest
      .fn()
      .mockRejectedValueOnce(new Error('Mutation failed'))
    mockUseCloudflareUploadByFileMutation.mockReturnValue([
      createCloudflareUploadByFile
    ] as any)

    const { result } = renderHook(() =>
      useImageUpload({ onUploadComplete, onUploadError })
    )

    const onDrop = mockUseDropzone.mock.calls[0][0]?.onDrop
    const file = new File(['file'], 'test.png', { type: 'image/png' })

    await act(async () => {
      await onDrop?.([file], [], {} as any)
    })

    expect(onUploadError).toHaveBeenCalledWith('unknown-error')
    expect(result.current.loading).toBe(false)
    expect(result.current.success).toBe(false)
  })

  it('should handle missing uploadUrl in mutation response', async () => {
    const createCloudflareUploadByFile = jest.fn().mockResolvedValue({
      data: {
        createCloudflareUploadByFile: {
          uploadUrl: null
        }
      }
    })
    mockUseCloudflareUploadByFileMutation.mockReturnValue([
      createCloudflareUploadByFile
    ] as any)

    const { result } = renderHook(() =>
      useImageUpload({ onUploadComplete, onUploadError })
    )

    const onDrop = mockUseDropzone.mock.calls[0][0]?.onDrop
    const file = new File(['file'], 'test.png', { type: 'image/png' })

    await act(async () => {
      await onDrop?.([file], [], {} as any)
    })

    expect(onUploadError).toHaveBeenCalledWith('unknown-error')
    expect(result.current.loading).toBe(false)
    expect(result.current.success).toBe(false)
  })
})
