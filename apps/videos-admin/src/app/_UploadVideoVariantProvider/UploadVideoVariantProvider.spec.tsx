import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'
import axios from 'axios'
import { SnackbarProvider, useSnackbar } from 'notistack'
import { ReactNode } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { type Mock } from 'vitest'

import { getExtension } from '../(dashboard)/videos/[videoId]/audio/add/_utils/getExtension'
import { refreshToken } from '../api'

import {
  COMPLETE_R2_MULTIPART,
  CREATE_VIDEO_VARIANT_UPLOAD_MUX,
  GET_VIDEO_VARIANT_UPLOAD,
  MARK_VIDEO_VARIANT_UPLOAD_R2_COMPLETE,
  MARK_VIDEO_VARIANT_UPLOAD_R2_PREPARED,
  PREPARE_R2_MULTIPART,
  START_VIDEO_VARIANT_UPLOAD,
  UploadVideoVariantProvider,
  useUploadVideoVariant
} from './UploadVideoVariantProvider'

vi.mock('axios', () => ({
  default: {
    put: vi.fn().mockResolvedValue({
      headers: {
        etag: '"etag-1"'
      }
    })
  }
}))

vi.mock('notistack', async () => ({
  ...(await vi.importActual('notistack')),
  useSnackbar: vi.fn()
}))

vi.mock('uuid', () => ({
  v4: vi.fn().mockReturnValue('uuidv4')
}))

vi.mock('../api', () => ({
  refreshToken: vi.fn().mockResolvedValue('refreshed-token')
}))

vi.mock(
  '../(dashboard)/videos/[videoId]/audio/add/_utils/getExtension',
  () => ({
    getExtension: vi.fn().mockReturnValue('.mp4')
  })
)

const mockFileName =
  'video-id/variants/language-id/videos/uuidv4/language-id_video-id.mp4'

const browserVideoMetadata = {
  duration: 123,
  durationMs: 123400,
  width: 1920,
  height: 1080
}

const originalCreateElement = document.createElement.bind(document)

function ensureUrlObjectMethods() {
  if (URL.createObjectURL == null) {
    Object.defineProperty(URL, 'createObjectURL', {
      value: vi.fn(),
      configurable: true
    })
  }
  if (URL.revokeObjectURL == null) {
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: vi.fn(),
      configurable: true
    })
  }
}

function mockBrowserVideoMetadata(metadata = browserVideoMetadata) {
  ensureUrlObjectMethods()
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:video')
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
  vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
    const element = originalCreateElement(tagName)

    if (tagName !== 'video') return element

    Object.defineProperties(element, {
      duration: { value: metadata.durationMs / 1000, configurable: true },
      videoWidth: { value: metadata.width, configurable: true },
      videoHeight: { value: metadata.height, configurable: true },
      src: {
        configurable: true,
        set() {
          setTimeout(() => {
            ;(element as HTMLVideoElement).onloadedmetadata?.(
              new Event('loadedmetadata')
            )
          }, 0)
        }
      }
    })
    vi.spyOn(element as HTMLVideoElement, 'load').mockImplementation(
      () => undefined
    )

    return element
  })
}

function mockBrowserVideoMetadataError() {
  ensureUrlObjectMethods()
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:video')
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
  vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
    const element = originalCreateElement(tagName)

    if (tagName !== 'video') return element

    Object.defineProperty(element, 'src', {
      configurable: true,
      set() {
        setTimeout(() => {
          ;(element as HTMLVideoElement).onerror?.(new Event('error'))
        }, 0)
      }
    })
    vi.spyOn(element as HTMLVideoElement, 'load').mockImplementation(
      () => undefined
    )

    return element
  })
}

const startVideoVariantUploadMock = {
  request: {
    query: START_VIDEO_VARIANT_UPLOAD,
    variables: {
      input: {
        source: 'videos-admin',
        sourceKey: 'uuidv4',
        videoId: 'video-id',
        edition: 'base',
        languageId: 'language-id',
        version: 1,
        published: false,
        originalFilename: 'test.mp4',
        contentType: 'video/mp4',
        contentLength: 4,
        duration: browserVideoMetadata.duration,
        durationMs: browserVideoMetadata.durationMs,
        width: browserVideoMetadata.width,
        height: browserVideoMetadata.height
      }
    }
  },
  result: {
    data: {
      videoVariantUploadStart: {
        id: 'upload-id',
        status: 'created'
      }
    }
  }
}

const prepareR2MultipartMock = {
  request: {
    query: PREPARE_R2_MULTIPART,
    variables: {
      input: {
        fileName: mockFileName,
        contentType: 'video/mp4',
        contentLength: 4,
        originalFilename: 'test.mp4',
        videoId: 'video-id'
      }
    }
  },
  result: vi.fn(() => ({
    data: {
      cloudflareR2MultipartPrepare: {
        id: 'r2-asset.id',
        uploadId: 'r2-upload-id',
        fileName: mockFileName,
        publicUrl: `https://mock.cloudflare-domain.com/${mockFileName}`,
        partSize: 5 * 1024 * 1024,
        parts: [
          {
            partNumber: 1,
            uploadUrl: 'https://mock-upload-part-url'
          }
        ]
      }
    }
  }))
}

const markR2PreparedMock = {
  request: {
    query: MARK_VIDEO_VARIANT_UPLOAD_R2_PREPARED,
    variables: {
      id: 'upload-id',
      r2AssetId: 'r2-asset.id'
    }
  },
  result: {
    data: {
      videoVariantUploadMarkR2Prepared: {
        id: 'upload-id',
        status: 'r2Prepared',
        r2AssetId: 'r2-asset.id'
      }
    }
  }
}

const completeR2MultipartMock = {
  request: {
    query: COMPLETE_R2_MULTIPART,
    variables: {
      input: {
        id: 'r2-asset.id',
        fileName: mockFileName,
        uploadId: 'r2-upload-id',
        parts: [{ partNumber: 1, eTag: 'etag-1' }]
      }
    }
  },
  result: {
    data: {
      cloudflareR2CompleteMultipart: {
        id: 'r2-asset.id',
        fileName: mockFileName,
        publicUrl: `https://mock.cloudflare-domain.com/${mockFileName}`
      }
    }
  }
}

const markR2CompleteMock = {
  request: {
    query: MARK_VIDEO_VARIANT_UPLOAD_R2_COMPLETE,
    variables: { id: 'upload-id' }
  },
  result: {
    data: {
      videoVariantUploadMarkR2Complete: {
        id: 'upload-id',
        status: 'r2Uploaded'
      }
    }
  }
}

const createMuxMock = {
  request: {
    query: CREATE_VIDEO_VARIANT_UPLOAD_MUX,
    variables: {
      id: 'upload-id',
      downloadable: true,
      maxResolution: 'uhd'
    }
  },
  result: {
    data: {
      videoVariantUploadCreateMux: {
        id: 'upload-id',
        status: 'muxCreated',
        muxVideoId: 'mux-id'
      }
    }
  }
}

const getUploadVariantCreatedMock = {
  request: {
    query: GET_VIDEO_VARIANT_UPLOAD,
    variables: { id: 'upload-id' }
  },
  result: {
    data: {
      videoVariantUpload: {
        id: 'upload-id',
        status: 'variantCreated',
        errorMessage: null,
        muxVideoId: 'mux-id',
        videoVariantId: 'variant-id',
        videoVariant: {
          id: 'variant-id',
          videoId: 'video-id',
          slug: 'video-slug/en',
          hls: 'https://stream.mux.com/playback-id.m3u8',
          language: {
            id: 'language-id',
            slug: 'en',
            name: {
              value: 'English',
              primary: true
            }
          }
        }
      }
    }
  }
}

const initialStateForTests = {
  isUploading: false,
  uploadProgress: 0,
  uploadedBytes: 0,
  totalBytes: 0,
  uploadSpeedBps: null,
  etaSeconds: null,
  isProcessing: false,
  error: null,
  uploadId: null,
  muxVideoId: null,
  uploadStatus: null,
  edition: null,
  languageId: null,
  languageSlug: null,
  videoId: null,
  published: null,
  onComplete: undefined,
  videoSlug: null
}

const mockEnqueueSnackbar = vi.fn()

const createWrapper = (mocks: any[] = []) => {
  return ({ children }: { children: ReactNode }) => {
    ;(useSnackbar as Mock).mockReturnValue({
      enqueueSnackbar: mockEnqueueSnackbar
    })

    return (
      <MockedProvider mocks={mocks}>
        <SnackbarProvider>
          <UploadVideoVariantProvider>{children}</UploadVideoVariantProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
  }
}

async function startTestUpload(result: any) {
  await act(async () => {
    await result.current.startUpload(
      new File(['test'], 'test.mp4', { type: 'video/mp4' }),
      'video-id',
      'language-id',
      'en',
      'base',
      false,
      'video-slug',
      undefined
    )
  })
}

describe('UploadVideoVariantContext', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
    ;(uuidv4 as Mock).mockReturnValue('uuidv4')
    ;(getExtension as Mock).mockReturnValue('.mp4')
    ;(axios.put as Mock).mockResolvedValue({
      headers: { etag: '"etag-1"' }
    })
    ;(refreshToken as Mock).mockResolvedValue('refreshed-token')
    mockBrowserVideoMetadata()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useUploadVideoVariant(), {
      wrapper: createWrapper()
    })

    expect(result.current.uploadState).toEqual(initialStateForTests)
  })

  it('uses backend lifecycle calls and resets after variant creation', async () => {
    const mocks = [
      startVideoVariantUploadMock,
      prepareR2MultipartMock,
      markR2PreparedMock,
      completeR2MultipartMock,
      markR2CompleteMock,
      createMuxMock,
      getUploadVariantCreatedMock
    ]

    const { result } = renderHook(() => useUploadVideoVariant(), {
      wrapper: createWrapper(mocks)
    })

    await startTestUpload(result)

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        'https://mock-upload-part-url',
        expect.any(Blob),
        expect.objectContaining({
          headers: { 'Content-Type': 'video/mp4' },
          onUploadProgress: expect.any(Function),
          signal: expect.anything()
        })
      )
    })

    await waitFor(() => {
      expect(result.current.uploadState).toEqual(initialStateForTests)
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Audio Language Added', {
        variant: 'success'
      })
    })
  })

  it('fails before starting upload lifecycle when browser metadata cannot be read', async () => {
    mockBrowserVideoMetadataError()

    const { result } = renderHook(() => useUploadVideoVariant(), {
      wrapper: createWrapper([startVideoVariantUploadMock])
    })

    await startTestUpload(result)

    await waitFor(() => {
      expect(result.current.uploadState.error).toBe(
        'Unable to read video metadata'
      )
      expect(prepareR2MultipartMock.result).not.toHaveBeenCalled()
    })
  })

  it('handles R2 multipart creation error', async () => {
    const prepareR2MultipartErrorMock = {
      request: prepareR2MultipartMock.request,
      result: {
        data: {
          cloudflareR2MultipartPrepare: {
            id: 'r2-id',
            uploadId: null,
            fileName: mockFileName,
            publicUrl: null,
            parts: null
          }
        }
      }
    }

    const { result } = renderHook(() => useUploadVideoVariant(), {
      wrapper: createWrapper([
        startVideoVariantUploadMock,
        prepareR2MultipartErrorMock
      ])
    })

    await startTestUpload(result)

    await waitFor(() => {
      expect(result.current.uploadState.error).toBe(
        'Failed to prepare R2 multipart upload'
      )
      expect(result.current.uploadState.isUploading).toBe(false)
      expect(result.current.uploadState.isProcessing).toBe(false)
    })
  })

  it('handles Mux lifecycle creation error', async () => {
    const createMuxErrorMock = {
      request: createMuxMock.request,
      error: new Error('Mux creation failed')
    }

    const { result } = renderHook(() => useUploadVideoVariant(), {
      wrapper: createWrapper([
        startVideoVariantUploadMock,
        prepareR2MultipartMock,
        markR2PreparedMock,
        completeR2MultipartMock,
        markR2CompleteMock,
        createMuxErrorMock
      ])
    })

    await startTestUpload(result)

    await waitFor(() => {
      expect(result.current.uploadState.error).toBe('Mux creation failed')
      expect(result.current.uploadState.isUploading).toBe(false)
      expect(result.current.uploadState.isProcessing).toBe(false)
    })
  })

  it('resets state when clearUploadState is called', async () => {
    const { result } = renderHook(() => useUploadVideoVariant(), {
      wrapper: createWrapper([
        startVideoVariantUploadMock,
        {
          request: prepareR2MultipartMock.request,
          error: new Error('prepare failed')
        }
      ])
    })

    await startTestUpload(result)

    await waitFor(() => {
      expect(result.current.uploadState.error).toBe('prepare failed')
    })

    act(() => {
      result.current.clearUploadState()
    })

    expect(result.current.uploadState).toEqual(initialStateForTests)
  })
})
