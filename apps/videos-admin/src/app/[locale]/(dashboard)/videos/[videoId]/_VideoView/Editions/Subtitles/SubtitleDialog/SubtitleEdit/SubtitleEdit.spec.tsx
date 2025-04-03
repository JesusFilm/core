import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'
import { SnackbarProvider } from 'notistack'

import { getLanguagesMock } from '@core/journeys/ui/useLanguagesQuery/useLanguagesQuery.mock'

import { useAdminVideoMock } from '../../../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import { getCreateR2AssetMock } from '../../../../../../../../../../libs/useCreateR2Asset/useCreateR2Asset.mock'
import {
  UpdateVideoSubtitle,
  UpdateVideoSubtitleVariables
} from '../../../../../../../../../../libs/useUpdateVideoSubtitle'
import { getUpdateVideoSubtitleMock } from '../../../../../../../../../../libs/useUpdateVideoSubtitle/useUpdateVideoSubtitle.mock'
import { VideoProvider } from '../../../../../../../../../../libs/VideoProvider'

import { SubtitleEdit } from './SubtitleEdit'

const unMockedFetch = global.fetch

const originalCreateObjectURL = global.URL.createObjectURL

global.URL.createObjectURL = jest.fn(() => 'mock-url')

const mockVideo = useAdminVideoMock['result']?.['data']?.['adminVideo']
const mockEdition = mockVideo.videoEditions[0]
const mockSubtitle = mockEdition.videoSubtitles[0]
const mockSubtitle2 = mockEdition.videoSubtitles[1]

// Create a mock subtitleLanguagesMap
const mockSubtitleLanguagesMap = new Map([
  [mockSubtitle.language.id, mockSubtitle],
  [mockSubtitle2.language.id, mockSubtitle2]
])

type EditSubtitleInput = Pick<
  UpdateVideoSubtitleVariables['input'],
  'vttSrc' | 'srtSrc' | 'primary'
>

const getEditSubtitleMock = <T extends EditSubtitleInput>(
  input: T
): MockedResponse<UpdateVideoSubtitle, UpdateVideoSubtitleVariables> =>
  getUpdateVideoSubtitleMock({
    ...input,
    id: 'subtitle1.id',
    edition: 'base',
    languageId: '529'
  })

const subtitleEditWithoutFileMock = getEditSubtitleMock({
  primary: true,
  vttSrc: null,
  srtSrc: null,
  vttAssetId: 'vtt-asset-id-1',
  srtAssetId: 'srt-asset-id-1',
  vttVersion: 1,
  srtVersion: 1
})

const subtitleEditWithFileMock = getEditSubtitleMock({
  id: 'subtitle1.id',
  edition: 'base',
  languageId: '529',
  primary: true,
  vttSrc:
    'https://mock.cloudflare-domain.com/1_jf-0-0/editions/edition.id/subtitles/1_jf-0-0_edition.id_529.vtt',
  srtSrc: null,
  vttAssetId: 'r2-asset.id',
  srtAssetId: 'srt-asset-id-1',
  vttVersion: 2,
  srtVersion: 1
})

const subtitleEditWithSrtFileMock = getEditSubtitleMock({
  id: 'subtitle1.id',
  edition: 'base',
  languageId: '529',
  primary: true,
  vttSrc: null,
  srtSrc:
    'https://mock.cloudflare-domain.com/1_jf-0-0/editions/edition.id/subtitles/1_jf-0-0_edition.id_529.srt',
  vttAssetId: 'vtt-asset-id-1',
  srtAssetId: 'r2-asset.id',
  vttVersion: 1,
  srtVersion: 2
})

const createR2VttAssetMock = getCreateR2AssetMock({
  videoId: '1_jf-0-0',
  contentType: 'text/vtt',
  fileName:
    '1_jf-0-0/editions/edition.id/subtitles/1_jf-0-0_edition.id_529.vtt',
  originalFilename: 'subtitle1.vtt',
  contentLength: 17
})

const createR2SrtAssetMock = getCreateR2AssetMock({
  videoId: '1_jf-0-0',
  contentType: 'application/x-subrip',
  fileName:
    '1_jf-0-0/editions/edition.id/subtitles/1_jf-0-0_edition.id_529.srt',
  originalFilename: 'subtitle1.srt',
  contentLength: 17
})

describe('SubtitleEdit', () => {
  beforeAll(() => {
    global.fetch = jest.fn(
      async () =>
        await Promise.resolve({
          ok: true
        })
    ) as jest.Mock
  })

  afterAll(() => {
    global.fetch = unMockedFetch
    global.URL.createObjectURL = originalCreateObjectURL
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render', () => {
    render(
      <NextIntlClientProvider locale="en">
        <VideoProvider video={mockVideo}>
          <MockedProvider mocks={[]}>
            <SubtitleEdit
              subtitle={mockSubtitle}
              edition={mockEdition}
              subtitleLanguagesMap={mockSubtitleLanguagesMap}
            />
          </MockedProvider>
        </VideoProvider>
      </NextIntlClientProvider>
    )

    expect(screen.getByTestId('SubtitleForm')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument()
  })

  it('should prevent changing to a language that already has a subtitle', async () => {
    render(
      <NextIntlClientProvider locale="en">
        <SnackbarProvider>
          <VideoProvider video={mockVideo}>
            <MockedProvider mocks={[getLanguagesMock]}>
              <SubtitleEdit
                subtitle={mockSubtitle}
                edition={mockEdition}
                subtitleLanguagesMap={mockSubtitleLanguagesMap}
              />
            </MockedProvider>
          </VideoProvider>
        </SnackbarProvider>
      </NextIntlClientProvider>
    )

    const user = userEvent.setup()

    // The current subtitle's language should be in the dropdown
    const select = screen.getByRole('combobox', { name: 'Language' })
    await user.click(select)

    // The language of the current subtitle should be in the dropdown
    await waitFor(() => {
      expect(
        screen.getByRole('option', {
          name: mockSubtitle.language.name[0].value
        })
      ).toBeInTheDocument()
    })

    // But the language of the other subtitle should not be in the dropdown
    await waitFor(() => {
      expect(
        screen.queryByRole('option', {
          name: mockSubtitle2.language.name[0].value
        })
      ).not.toBeInTheDocument()
    })
  })

  describe('subtitle file upload', () => {
    describe('vtt', () => {
      it('should update subtitle without a file', async () => {
        render(
          <NextIntlClientProvider locale="en">
            <VideoProvider video={mockVideo}>
              <MockedProvider
                mocks={[
                  getLanguagesMock,
                  createR2VttAssetMock,
                  subtitleEditWithoutFileMock
                ]}
              >
                <SubtitleEdit
                  subtitle={{
                    ...mockSubtitle,
                    primary: false,
                    value: null,
                    vttSrc: null,
                    srtSrc: null
                  }}
                  edition={mockEdition}
                  subtitleLanguagesMap={mockSubtitleLanguagesMap}
                />
              </MockedProvider>
            </VideoProvider>
          </NextIntlClientProvider>
        )

        const user = userEvent.setup()

        const select = screen.getByRole('combobox', { name: 'Language' })
        await user.click(select)
        await waitFor(async () => {
          await user.click(screen.getByRole('option', { name: 'English' }))
        })
        await user.click(screen.getByRole('button', { name: 'Update' }))

        await waitFor(() => {
          expect(subtitleEditWithoutFileMock.result).toHaveBeenCalled()
        })
      })

      it('should update without an existing file', async () => {
        // Create a spy for the createR2VttAssetMock.result
        const originalCreateR2VttAssetResult = createR2VttAssetMock.result
        createR2VttAssetMock.result = jest.fn().mockImplementation(({}) => {
          if (typeof originalCreateR2VttAssetResult === 'function') {
            return originalCreateR2VttAssetResult({})
          }
          return originalCreateR2VttAssetResult
        })

        const originalSubtitleEditWithFileResult =
          subtitleEditWithFileMock.result
        subtitleEditWithFileMock.result = jest.fn().mockImplementation(({}) => {
          if (typeof originalSubtitleEditWithFileResult === 'function') {
            return originalSubtitleEditWithFileResult({})
          }
          return originalSubtitleEditWithFileResult
        })

        render(
          <NextIntlClientProvider locale="en">
            <VideoProvider video={mockVideo}>
              <MockedProvider
                mocks={[
                  getLanguagesMock,
                  createR2VttAssetMock,
                  subtitleEditWithFileMock
                ]}
              >
                <SubtitleEdit
                  subtitle={{
                    ...mockSubtitle,
                    primary: false,
                    value: null,
                    vttSrc: null,
                    srtSrc: null
                  }}
                  edition={mockEdition}
                  subtitleLanguagesMap={mockSubtitleLanguagesMap}
                />
              </MockedProvider>
            </VideoProvider>
          </NextIntlClientProvider>
        )
        const user = userEvent.setup()

        const select = screen.getByRole('combobox', { name: 'Language' })
        await user.click(select)
        await waitFor(async () => {
          await user.click(screen.getByRole('option', { name: 'English' }))
        })

        const dropzone = screen.getByTestId('DropZone')
        await user.upload(
          dropzone,
          new File(['subtitle file'], 'subtitle1.vtt', { type: 'text/vtt' })
        )

        await user.click(screen.getByRole('button', { name: 'Update' }))

        await waitFor(() => {
          expect(createR2VttAssetMock.result).toHaveBeenCalled()
        })
        expect(subtitleEditWithFileMock.result).toHaveBeenCalled()
      })

      it('should update subtitle with an existing file', async () => {
        const subtitleEditWithExistingFileMock = getEditSubtitleMock({
          id: 'subtitle1.id',
          edition: 'base',
          languageId: '529',
          primary: true,
          vttSrc:
            'https://mock.cloudflare-domain.com/1_jf-0-0/editions/edition.id/subtitles/1_jf-0-0_edition.id_529.vtt',
          srtSrc:
            'https://d389zwyrhi20m0.cloudfront.net/529/1_jf-0-0/0-0-JLtib-529-31474.srt',
          vttAssetId: 'r2-asset.id',
          srtAssetId: 'srt-asset-id-1',
          vttVersion: 2,
          srtVersion: 1
        })

        // Create spies for the mocks
        const originalCreateR2VttAssetResult = createR2VttAssetMock.result
        createR2VttAssetMock.result = jest.fn().mockImplementation(({}) => {
          if (typeof originalCreateR2VttAssetResult === 'function') {
            return originalCreateR2VttAssetResult({})
          }
          return originalCreateR2VttAssetResult
        })

        const originalSubtitleEditWithExistingFileResult =
          subtitleEditWithExistingFileMock.result
        subtitleEditWithExistingFileMock.result = jest
          .fn()
          .mockImplementation(({}) => {
            if (
              typeof originalSubtitleEditWithExistingFileResult === 'function'
            ) {
              return originalSubtitleEditWithExistingFileResult({})
            }
            return originalSubtitleEditWithExistingFileResult
          })

        render(
          <NextIntlClientProvider locale="en">
            <VideoProvider video={mockVideo}>
              <MockedProvider
                mocks={[
                  getLanguagesMock,
                  createR2VttAssetMock,
                  subtitleEditWithExistingFileMock
                ]}
              >
                <SubtitleEdit
                  subtitle={{
                    ...mockSubtitle,
                    primary: false
                  }}
                  edition={mockEdition}
                  subtitleLanguagesMap={mockSubtitleLanguagesMap}
                />
              </MockedProvider>
            </VideoProvider>
          </NextIntlClientProvider>
        )
        const user = userEvent.setup()

        const select = screen.getByRole('combobox', { name: 'Language' })
        await user.click(select)
        await waitFor(async () => {
          await user.click(screen.getByRole('option', { name: 'English' }))
        })

        const dropzone = screen.getByTestId('DropZone')
        await user.upload(
          dropzone,
          new File(['subtitle file'], 'subtitle1.vtt', { type: 'text/vtt' })
        )

        await user.click(screen.getByRole('button', { name: 'Update' }))

        await waitFor(() => {
          expect(createR2VttAssetMock.result).toHaveBeenCalled()
        })
        expect(subtitleEditWithExistingFileMock.result).toHaveBeenCalled()
      })
    })

    describe('srt', () => {
      it('should update subtitle without a file', async () => {
        render(
          <NextIntlClientProvider locale="en">
            <VideoProvider video={mockVideo}>
              <MockedProvider
                mocks={[
                  getLanguagesMock,
                  createR2SrtAssetMock,
                  subtitleEditWithoutFileMock
                ]}
              >
                <SubtitleEdit
                  subtitle={{
                    ...mockSubtitle,
                    primary: false,
                    value: null,
                    vttSrc: null,
                    srtSrc: null
                  }}
                  edition={mockEdition}
                  subtitleLanguagesMap={mockSubtitleLanguagesMap}
                />
              </MockedProvider>
            </VideoProvider>
          </NextIntlClientProvider>
        )

        const user = userEvent.setup()

        const select = screen.getByRole('combobox', { name: 'Language' })
        await user.click(select)
        await waitFor(async () => {
          await user.click(screen.getByRole('option', { name: 'English' }))
        })
        await user.click(screen.getByRole('button', { name: 'Update' }))

        await waitFor(() => {
          expect(subtitleEditWithoutFileMock.result).toHaveBeenCalled()
        })
      })

      it('should update without an existing file', async () => {
        // Create a spy for the createR2SrtAssetMock.result
        const originalCreateR2SrtAssetResult = createR2SrtAssetMock.result
        createR2SrtAssetMock.result = jest.fn().mockImplementation(({}) => {
          if (typeof originalCreateR2SrtAssetResult === 'function') {
            return originalCreateR2SrtAssetResult({})
          }
          return originalCreateR2SrtAssetResult
        })

        const originalSubtitleEditWithSrtFileResult =
          subtitleEditWithSrtFileMock.result
        subtitleEditWithSrtFileMock.result = jest
          .fn()
          .mockImplementation(({}) => {
            if (typeof originalSubtitleEditWithSrtFileResult === 'function') {
              return originalSubtitleEditWithSrtFileResult({})
            }
            return originalSubtitleEditWithSrtFileResult
          })

        render(
          <NextIntlClientProvider locale="en">
            <VideoProvider video={mockVideo}>
              <MockedProvider
                mocks={[
                  getLanguagesMock,
                  createR2SrtAssetMock,
                  subtitleEditWithSrtFileMock
                ]}
              >
                <SubtitleEdit
                  subtitle={{
                    ...mockSubtitle,
                    primary: false,
                    value: null,
                    vttSrc: null,
                    srtSrc: null
                  }}
                  edition={mockEdition}
                  subtitleLanguagesMap={mockSubtitleLanguagesMap}
                />
              </MockedProvider>
            </VideoProvider>
          </NextIntlClientProvider>
        )
        const user = userEvent.setup()

        const select = screen.getByRole('combobox', { name: 'Language' })
        await user.click(select)
        await waitFor(async () => {
          await user.click(screen.getByRole('option', { name: 'English' }))
        })

        const dropzone = screen.getByTestId('DropZone')
        await user.upload(
          dropzone,
          new File(['subtitle file'], 'subtitle1.srt', {
            type: 'application/x-subrip'
          })
        )

        await user.click(screen.getByRole('button', { name: 'Update' }))

        await waitFor(() => {
          expect(createR2SrtAssetMock.result).toHaveBeenCalled()
        })
        expect(subtitleEditWithSrtFileMock.result).toHaveBeenCalled()
      })

      it('should update subtitle with an existing file', async () => {
        const subtitleEditWithExistingSrtFileMock = getEditSubtitleMock({
          id: 'subtitle1.id',
          edition: 'base',
          languageId: '529',
          primary: true,
          vttSrc: null,
          srtSrc:
            'https://mock.cloudflare-domain.com/1_jf-0-0/editions/edition.id/subtitles/1_jf-0-0_edition.id_529.srt',
          vttAssetId: 'vtt-asset-id-1',
          srtAssetId: 'r2-asset.id',
          vttVersion: 1,
          srtVersion: 2
        })

        // Create spies for the mocks
        const originalCreateR2SrtAssetResult = createR2SrtAssetMock.result
        createR2SrtAssetMock.result = jest.fn().mockImplementation(({}) => {
          if (typeof originalCreateR2SrtAssetResult === 'function') {
            return originalCreateR2SrtAssetResult({})
          }
          return originalCreateR2SrtAssetResult
        })

        const originalSubtitleEditWithExistingSrtFileResult =
          subtitleEditWithExistingSrtFileMock.result
        subtitleEditWithExistingSrtFileMock.result = jest
          .fn()
          .mockImplementation(({}) => {
            if (
              typeof originalSubtitleEditWithExistingSrtFileResult ===
              'function'
            ) {
              return originalSubtitleEditWithExistingSrtFileResult({})
            }
            return originalSubtitleEditWithExistingSrtFileResult
          })

        render(
          <NextIntlClientProvider locale="en">
            <VideoProvider video={mockVideo}>
              <MockedProvider
                mocks={[
                  getLanguagesMock,
                  createR2SrtAssetMock,
                  subtitleEditWithExistingSrtFileMock
                ]}
              >
                <SubtitleEdit
                  subtitle={{
                    ...mockSubtitle,
                    primary: false
                  }}
                  edition={mockEdition}
                  subtitleLanguagesMap={mockSubtitleLanguagesMap}
                />
              </MockedProvider>
            </VideoProvider>
          </NextIntlClientProvider>
        )
        const user = userEvent.setup()

        const select = screen.getByRole('combobox', { name: 'Language' })
        await user.click(select)
        await waitFor(async () => {
          await user.click(screen.getByRole('option', { name: 'English' }))
        })

        const dropzone = screen.getByTestId('DropZone')
        await user.upload(
          dropzone,
          new File(['subtitle file'], 'subtitle1.srt', {
            type: 'application/x-subrip'
          })
        )

        await user.click(screen.getByRole('button', { name: 'Update' }))

        await waitFor(() => {
          expect(createR2SrtAssetMock.result).toHaveBeenCalled()
        })
        expect(subtitleEditWithExistingSrtFileMock.result).toHaveBeenCalled()
      })
    })

    it('should update subtitle with both vtt and srt files simultaneously', async () => {
      const createR2VttAssetMock2 = getCreateR2AssetMock({
        videoId: '1_jf-0-0',
        contentType: 'text/vtt',
        fileName:
          '1_jf-0-0/editions/edition.id/subtitles/1_jf-0-0_edition.id_529.vtt',
        originalFilename: 'subtitle1.vtt',
        contentLength: 17
      })

      const createR2SrtAssetMock2 = getCreateR2AssetMock({
        videoId: '1_jf-0-0',
        contentType: 'application/x-subrip',
        fileName:
          '1_jf-0-0/editions/edition.id/subtitles/1_jf-0-0_edition.id_529.srt',
        originalFilename: 'subtitle1.srt',
        contentLength: 17
      })

      const subtitleEditWithBothFilesMock = getEditSubtitleMock({
        id: 'subtitle1.id',
        edition: 'base',
        languageId: '529',
        primary: true,
        vttSrc:
          'https://mock.cloudflare-domain.com/1_jf-0-0/editions/edition.id/subtitles/1_jf-0-0_edition.id_529.vtt',
        srtSrc:
          'https://mock.cloudflare-domain.com/1_jf-0-0/editions/edition.id/subtitles/1_jf-0-0_edition.id_529.srt',
        vttAssetId: 'r2-asset.id',
        srtAssetId: 'r2-asset.id',
        vttVersion: 2,
        srtVersion: 2
      })

      // Create spies for the mocks
      const originalCreateR2VttAssetMock2Result = createR2VttAssetMock2.result
      createR2VttAssetMock2.result = jest.fn().mockImplementation(({}) => {
        if (typeof originalCreateR2VttAssetMock2Result === 'function') {
          return originalCreateR2VttAssetMock2Result({})
        }
        return originalCreateR2VttAssetMock2Result
      })

      const originalCreateR2SrtAssetMock2Result = createR2SrtAssetMock2.result
      createR2SrtAssetMock2.result = jest.fn().mockImplementation(({}) => {
        if (typeof originalCreateR2SrtAssetMock2Result === 'function') {
          return originalCreateR2SrtAssetMock2Result({})
        }
        return originalCreateR2SrtAssetMock2Result
      })

      const originalSubtitleEditWithBothFilesMockResult =
        subtitleEditWithBothFilesMock.result
      subtitleEditWithBothFilesMock.result = jest
        .fn()
        .mockImplementation(({}) => {
          if (
            typeof originalSubtitleEditWithBothFilesMockResult === 'function'
          ) {
            return originalSubtitleEditWithBothFilesMockResult({})
          }
          return originalSubtitleEditWithBothFilesMockResult
        })

      render(
        <NextIntlClientProvider locale="en">
          <VideoProvider video={mockVideo}>
            <MockedProvider
              mocks={[
                getLanguagesMock,
                createR2VttAssetMock2,
                createR2SrtAssetMock2,
                subtitleEditWithBothFilesMock
              ]}
            >
              <SubtitleEdit
                subtitle={{
                  ...mockSubtitle,
                  primary: false,
                  value: null,
                  vttSrc: null,
                  srtSrc: null
                }}
                edition={mockEdition}
                subtitleLanguagesMap={mockSubtitleLanguagesMap}
              />
            </MockedProvider>
          </VideoProvider>
        </NextIntlClientProvider>
      )
      const user = userEvent.setup()

      const select = screen.getByRole('combobox', { name: 'Language' })
      await user.click(select)
      await waitFor(async () => {
        await user.click(screen.getByRole('option', { name: 'English' }))
      })

      const dropzone = screen.getByTestId('DropZone')
      await user.upload(
        dropzone,
        [
          new File(['subtitle file'], 'subtitle1.vtt', { type: 'text/vtt' }),
          new File(['subtitle file'], 'subtitle1.srt', {
            type: 'application/x-subrip'
          })
        ],
        { applyAccept: false }
      )

      await user.click(screen.getByRole('button', { name: 'Update' }))

      await waitFor(() => {
        expect(createR2VttAssetMock2.result).toHaveBeenCalled()
      })
      await waitFor(() => {
        expect(createR2SrtAssetMock2.result).toHaveBeenCalled()
      })
      expect(subtitleEditWithBothFilesMock.result).toHaveBeenCalled()
    })
  })
})
