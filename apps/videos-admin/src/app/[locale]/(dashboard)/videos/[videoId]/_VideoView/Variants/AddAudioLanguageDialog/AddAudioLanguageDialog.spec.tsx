import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { SnackbarProvider } from 'notistack'

import { GET_LANGUAGES } from '@core/journeys/ui/useLanguagesQuery'

import {
  CLOUDFLARE_R2_CREATE,
  CREATE_MUX_VIDEO_UPLOAD_BY_URL,
  CREATE_VIDEO_VARIANT,
  GET_MY_MUX_VIDEO,
  UploadVideoVariantProvider
} from '../../../../../../../../libs/UploadVideoVariantProvider'

import { AddAudioLanguageDialog } from './AddAudioLanguageDialog'

jest.mock('next/navigation', () => ({
  useParams: () => ({ videoId: 'video123' })
}))

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('uuidv4')
}))

jest.mock('axios', () => ({
  put: jest.fn().mockResolvedValue({})
}))

const getLanguagesMock = {
  request: {
    query: GET_LANGUAGES,
    variables: { languageId: '529' }
  },
  result: {
    data: {
      languages: [
        {
          id: '529',
          name: [
            { value: 'English', primary: true },
            { value: 'English', primary: false }
          ],
          slug: 'en'
        }
      ]
    }
  }
}

const createVideoVariantMock = {
  request: {
    query: CREATE_VIDEO_VARIANT,
    variables: {
      input: {
        id: '529_video123',
        videoId: 'video123',
        edition: 'base',
        languageId: '529',
        slug: 'video123/en',
        downloadable: true,
        published: true,
        muxVideoId: 'muxVideo1',
        hls: 'https://stream.mux.com/playback123.m3u8'
      }
    }
  },
  result: {
    data: {
      videoVariantCreate: {
        id: 'variant1',
        videoId: 'video123',
        slug: 'video123/en',
        published: true,
        language: {
          id: 'lang1',
          name: [
            { value: 'English', primary: true },
            { value: 'English', primary: false }
          ]
        }
      }
    }
  }
}

const createUnpublishedVideoVariantMock = {
  request: {
    query: CREATE_VIDEO_VARIANT,
    variables: {
      input: {
        id: '529_video123',
        videoId: 'video123',
        edition: 'base',
        languageId: '529',
        slug: 'video123/en',
        downloadable: true,
        published: false,
        muxVideoId: 'muxVideo1',
        hls: 'https://stream.mux.com/playback123.m3u8'
      }
    }
  },
  result: {
    data: {
      videoVariantCreate: {
        id: 'variant1',
        videoId: 'video123',
        slug: 'video123/en',
        published: false,
        language: {
          id: 'lang1',
          name: [
            { value: 'English', primary: true },
            { value: 'English', primary: false }
          ]
        }
      }
    }
  }
}

const cloudflareR2CreateMock = {
  request: {
    query: CLOUDFLARE_R2_CREATE,
    variables: {
      input: {
        fileName: 'video123/variants/529/videos/uuidv4/529_video123.mp4',
        contentType: 'video/mp4',
        contentLength: 4,
        videoId: 'video123'
      }
    }
  },
  result: {
    data: {
      cloudflareR2Create: {
        id: 'r2asset1',
        fileName: 'test.mp4',
        uploadUrl: 'https://upload.url',
        publicUrl: 'https://public.url'
      }
    }
  }
}

const createMuxVideoMock = {
  request: {
    query: CREATE_MUX_VIDEO_UPLOAD_BY_URL,
    variables: {
      url: 'https://public.url'
    }
  },
  result: {
    data: {
      createMuxVideoUploadByUrl: {
        id: 'muxVideo1',
        assetId: 'asset123',
        playbackId: 'playback123',
        readyToStream: false
      }
    }
  }
}

const getMuxVideoMock = {
  request: {
    query: GET_MY_MUX_VIDEO,
    variables: {
      id: 'muxVideo1'
    }
  },
  result: {
    data: {
      getMyMuxVideo: {
        id: 'muxVideo1',
        assetId: 'asset123',
        playbackId: 'playback123',
        readyToStream: true
      }
    }
  }
}

// Mock translations
const messages = {
  'Add Audio Language': 'Add Audio Language',
  Edition: 'Edition',
  Language: 'Language',
  Published: 'Published',
  Draft: 'Draft',
  Add: 'Add',
  Uploading: 'Uploading',
  'Uploading...': 'Uploading...',
  Processing: 'Processing',
  'Processing...': 'Processing...',
  'Upload Failed!': 'Upload Failed!',
  'Change file': 'Change file',
  'Upload file': 'Upload file',
  'Drop a video here': 'Drop a video here',
  'Something went wrong, try again': 'Something went wrong, try again',
  'Failed to create R2 asset': 'Failed to create R2 asset',
  Quality: 'Quality',
  Size: 'Size',
  Dimensions: 'Dimensions',
  URL: 'URL',
  Delete: 'Delete',
  'Audio Language Added': 'Audio Language Added'
}

describe('AddAudioLanguageDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render dialog with edition, language, and published inputs', async () => {
    render(
      <MockedProvider mocks={[getLanguagesMock]}>
        <SnackbarProvider>
          <NextIntlClientProvider locale="en" messages={messages}>
            <UploadVideoVariantProvider>
              <AddAudioLanguageDialog
                open
                handleClose={jest.fn()}
                variantLanguagesMap={new Map()}
                editions={[
                  {
                    id: 'edition1',
                    name: 'base',
                    videoSubtitles: [
                      {
                        id: 'subtitle1',
                        vttSrc: null,
                        srtSrc: null,
                        value: 'English Subtitle',
                        primary: true,
                        vttAsset: null,
                        srtAsset: null,
                        vttVersion: 0,
                        srtVersion: 0,
                        language: {
                          id: '529',
                          slug: 'en',
                          name: [{ value: 'English', primary: true }]
                        }
                      }
                    ]
                  }
                ]}
              />
            </UploadVideoVariantProvider>
          </NextIntlClientProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(screen.getByText('Add Audio Language')).toBeInTheDocument()
    expect(screen.getByTestId('EditionSelect')).toBeInTheDocument()
    expect(screen.getByLabelText('Language')).toBeInTheDocument()
    expect(screen.getByLabelText('Published')).toBeInTheDocument()
    expect(screen.getByLabelText('Published')).toBeChecked()
  })

  it('should disable add button when no language selected', async () => {
    const getLanguagesMockResult = jest
      .fn()
      .mockReturnValue(getLanguagesMock.result)
    render(
      <MockedProvider
        mocks={[{ ...getLanguagesMock, result: getLanguagesMockResult }]}
      >
        <SnackbarProvider>
          <NextIntlClientProvider locale="en" messages={messages}>
            <UploadVideoVariantProvider>
              <AddAudioLanguageDialog
                open
                handleClose={jest.fn()}
                variantLanguagesMap={new Map()}
                editions={[
                  {
                    id: 'edition1',
                    name: 'base',
                    videoSubtitles: [
                      {
                        id: 'subtitle1',
                        vttSrc: null,
                        srtSrc: null,
                        value: 'English Subtitle',
                        primary: true,
                        vttAsset: null,
                        srtAsset: null,
                        vttVersion: 0,
                        srtVersion: 0,
                        language: {
                          id: '529',
                          slug: 'en',
                          name: [{ value: 'English', primary: true }]
                        }
                      }
                    ]
                  }
                ]}
              />
            </UploadVideoVariantProvider>
          </NextIntlClientProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(getLanguagesMockResult).toHaveBeenCalled())
    expect(screen.getByText('Add')).toBeDisabled()
  })

  it('should handle complete upload and variant creation flow with published state', async () => {
    const handleClose = jest.fn()
    const getLanguagesMockResult = jest
      .fn()
      .mockReturnValue(getLanguagesMock.result)
    const cloudflareR2CreateMockResult = jest
      .fn()
      .mockReturnValue(cloudflareR2CreateMock.result)
    const createMuxVideoMockResult = jest
      .fn()
      .mockReturnValue(createMuxVideoMock.result)
    const getMuxVideoMockResult = jest
      .fn()
      .mockReturnValue(getMuxVideoMock.result)
    const createVideoVariantMockResult = jest
      .fn()
      .mockReturnValue(createVideoVariantMock.result)

    render(
      <MockedProvider
        mocks={[
          { ...getLanguagesMock, result: getLanguagesMockResult },
          { ...cloudflareR2CreateMock, result: cloudflareR2CreateMockResult },
          { ...createMuxVideoMock, result: createMuxVideoMockResult },
          { ...getMuxVideoMock, result: getMuxVideoMockResult },
          { ...createVideoVariantMock, result: createVideoVariantMockResult }
        ]}
      >
        <SnackbarProvider>
          <NextIntlClientProvider locale="en" messages={messages}>
            <UploadVideoVariantProvider>
              <AddAudioLanguageDialog
                open
                handleClose={handleClose}
                variantLanguagesMap={new Map()}
                editions={[
                  {
                    id: 'edition1',
                    name: 'base',
                    videoSubtitles: [
                      {
                        id: 'subtitle1',
                        vttSrc: null,
                        srtSrc: null,
                        value: 'English Subtitle',
                        primary: true,
                        vttAsset: null,
                        srtAsset: null,
                        vttVersion: 0,
                        srtVersion: 0,
                        language: {
                          id: '529',
                          slug: 'en',
                          name: [{ value: 'English', primary: true }]
                        }
                      }
                    ]
                  }
                ]}
              />
            </UploadVideoVariantProvider>
          </NextIntlClientProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(getLanguagesMockResult).toHaveBeenCalled())
    // Select edition
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Edition' }))
    fireEvent.click(screen.getByRole('option', { name: 'base' }))

    // Select language
    fireEvent.mouseDown(screen.getByLabelText('Language'))
    await waitFor(() => {
      fireEvent.click(screen.getByRole('option', { name: 'English English' }))
    })

    // Upload file
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })
    const input = screen.getByTestId('DropZone')
    Object.defineProperty(input, 'files', { value: [file] })
    fireEvent.drop(input)

    // Submit form
    await waitFor(() => {
      expect(screen.getByText('Add')).not.toBeDisabled()
    })
    await waitFor(() =>
      fireEvent.click(screen.getByRole('button', { name: 'Add' }))
    )
    await waitFor(() => {
      expect(cloudflareR2CreateMockResult).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(createMuxVideoMockResult).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(getMuxVideoMockResult).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(createVideoVariantMockResult).toHaveBeenCalled()
    })
    expect(handleClose).toHaveBeenCalled()
  })

  it('should handle complete upload and variant creation flow with unpublished state', async () => {
    const handleClose = jest.fn()
    const getLanguagesMockResult = jest
      .fn()
      .mockReturnValue(getLanguagesMock.result)

    render(
      <MockedProvider
        mocks={[
          { ...getLanguagesMock, result: getLanguagesMockResult },
          cloudflareR2CreateMock,
          createMuxVideoMock,
          getMuxVideoMock,
          createUnpublishedVideoVariantMock
        ]}
      >
        <SnackbarProvider>
          <NextIntlClientProvider locale="en" messages={messages}>
            <UploadVideoVariantProvider>
              <AddAudioLanguageDialog
                open
                handleClose={handleClose}
                variantLanguagesMap={new Map()}
                editions={[
                  {
                    id: 'edition1',
                    name: 'base',
                    videoSubtitles: [
                      {
                        id: 'subtitle1',
                        vttSrc: null,
                        srtSrc: null,
                        value: 'English Subtitle',
                        primary: true,
                        vttAsset: null,
                        srtAsset: null,
                        vttVersion: 0,
                        srtVersion: 0,
                        language: {
                          id: '529',
                          slug: 'en',
                          name: [{ value: 'English', primary: true }]
                        }
                      }
                    ]
                  }
                ]}
              />
            </UploadVideoVariantProvider>
          </NextIntlClientProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(getLanguagesMockResult).toHaveBeenCalled())

    // Select edition
    fireEvent.mouseDown(screen.getByTestId('EditionSelect'))

    // Wait for the dropdown to open and click on the option
    await waitFor(() => {
      // Directly find the select option by its text
      const baseOption = screen.getByText('base')
      fireEvent.click(baseOption)
    })

    // Select language
    fireEvent.mouseDown(screen.getByLabelText('Language'))

    // Wait for language dropdown options
    await waitFor(() => {
      // Use getByText to find the English option
      const englishOption = screen.getByText(/English/i)
      fireEvent.click(englishOption)
    })

    // Toggle published state
    fireEvent.click(screen.getByLabelText('Published'))

    // Create a test file
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })
    const input = screen.getByTestId('DropZone')
    Object.defineProperty(input, 'files', { value: [file] })
    fireEvent.drop(input)

    // Submit form
    await waitFor(() => expect(screen.getByText('Add')).not.toBeDisabled())
    await waitFor(() =>
      fireEvent.click(screen.getByRole('button', { name: 'Add' }))
    )

    await waitFor(() => {
      expect(handleClose).toHaveBeenCalled()
    })
  })

  it('should show error when R2 upload fails', async () => {
    const cloudflareR2CreateMock = {
      request: {
        query: CLOUDFLARE_R2_CREATE,
        variables: {
          input: {
            fileName: 'video123/variants/529/videos/uuidv4/529_video123.mp4',
            contentType: 'video/mp4',
            contentLength: 4,
            videoId: 'video123'
          }
        }
      },
      result: {
        data: {
          cloudflareR2Create: {
            id: 'r2asset1',
            fileName: 'test.mp4',
            uploadUrl: null,
            publicUrl: null
          }
        }
      }
    }
    const result = jest.fn().mockReturnValue(cloudflareR2CreateMock.result)

    render(
      <MockedProvider
        mocks={[getLanguagesMock, { ...cloudflareR2CreateMock, result }]}
      >
        <SnackbarProvider>
          <NextIntlClientProvider locale="en" messages={messages}>
            <UploadVideoVariantProvider>
              <AddAudioLanguageDialog
                open
                handleClose={jest.fn()}
                variantLanguagesMap={new Map()}
                editions={[
                  {
                    id: 'edition1',
                    name: 'base',
                    videoSubtitles: [
                      {
                        id: 'subtitle1',
                        vttSrc: null,
                        srtSrc: null,
                        value: 'English Subtitle',
                        primary: true,
                        vttAsset: null,
                        srtAsset: null,
                        vttVersion: 0,
                        srtVersion: 0,
                        language: {
                          id: '529',
                          slug: 'en',
                          name: [{ value: 'English', primary: true }]
                        }
                      }
                    ]
                  }
                ]}
              />
            </UploadVideoVariantProvider>
          </NextIntlClientProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    // Select edition
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Edition' }))
    await waitFor(() => {
      fireEvent.click(screen.getByRole('option', { name: 'base' }))
    })

    // Select language
    fireEvent.mouseDown(screen.getByLabelText('Language'))
    await waitFor(() => {
      fireEvent.click(screen.getByRole('option', { name: 'English English' }))
    })

    // Upload file
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })
    const input = screen.getByTestId('DropZone')
    Object.defineProperty(input, 'files', { value: [file] })
    fireEvent.drop(input)

    // Submit form
    await waitFor(() => expect(screen.getByText('Add')).not.toBeDisabled())
    await waitFor(() =>
      fireEvent.click(screen.getByRole('button', { name: 'Add' }))
    )
    await waitFor(() => {
      expect(screen.getByText('Failed to create R2 asset')).toBeInTheDocument()
    })
  })
})
