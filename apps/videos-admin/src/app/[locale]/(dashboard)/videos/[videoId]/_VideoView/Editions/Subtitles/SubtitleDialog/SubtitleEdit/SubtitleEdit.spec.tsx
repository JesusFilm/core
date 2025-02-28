import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'

import { getLanguagesMock } from '@core/journeys/ui/useLanguagesQuery/useLanguagesQuery.mock'

import { useAdminVideoMock } from '../../../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import { getCreateR2AssetMock } from '../../../../../../../../../../libs/useCreateR2Asset/useCreateR2Asset.mock'
import { getDeleteR2AssetMock } from '../../../../../../../../../../libs/useDeleteR2Asset/useDeleteR2Asset.mock'
import { VideoProvider } from '../../../../../../../../../../libs/VideoProvider'

import {
  SubtitleEdit,
  UPDATE_VIDEO_SUBTITLE,
  UpdateVideoSubtitle,
  UpdateVideoSubtitleVariables
} from './SubtitleEdit'

const unMockedFetch = global.fetch

const mockVideo = useAdminVideoMock['result']?.['data']?.['adminVideo']
const mockEdition = mockVideo.videoEditions[0]
const mockSubtitle = mockEdition.videoSubtitles[0]

type EditSubtitleInput = Pick<
  UpdateVideoSubtitleVariables['input'],
  'vttSrc' | 'srtSrc' | 'primary'
>

const getEditSubtitleMock = <T extends EditSubtitleInput>(
  input: T
): MockedResponse<UpdateVideoSubtitle, UpdateVideoSubtitleVariables> => ({
  request: {
    query: UPDATE_VIDEO_SUBTITLE,
    variables: {
      input: {
        ...input,
        id: 'subtitle1.id',
        edition: 'base',
        languageId: '529'
      }
    }
  },
  result: jest.fn(() => ({
    data: {
      videoSubtitleUpdate: {
        id: 'subtitle1.id',
        edition: 'base',
        vttSrc: input.vttSrc ?? null,
        srtSrc: input.srtSrc ?? null,
        value: input.vttSrc ?? input.srtSrc ?? '',
        primary: input.primary ?? false,
        language: {
          id: '529',
          name: [{ value: 'English', primary: true }],
          slug: null
        }
      }
    }
  }))
})

const subtitleEditWithoutFileMock = getEditSubtitleMock({
  vttSrc: null,
  srtSrc: null,
  primary: true
})

const subtitleEditWithFileMock = getEditSubtitleMock({
  vttSrc:
    'https://mock.cloudflare-domain.com/1_jf-0-0/editions/edition.id/subtitles/1_jf-0-0_edition.id_529.vtt',
  srtSrc: null,
  primary: true
})

const createR2VttAssetMock = getCreateR2AssetMock({
  videoId: '1_jf-0-0',
  contentType: 'text/vtt',
  fileName: '1_jf-0-0/editions/edition.id/subtitles/1_jf-0-0_edition.id_529.vtt'
})

const createR2SrtAssetMock = getCreateR2AssetMock({
  videoId: '1_jf-0-0',
  contentType: 'application/x-subrip',
  fileName: '1_jf-0-0/editions/edition.id/subtitles/1_jf-0-0_edition.id_529.srt'
})

const deleteR2AssetMock = getDeleteR2AssetMock({
  id: 'subtitle1.id'
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
  })

  it('should render', () => {
    render(
      <NextIntlClientProvider locale="en">
        <VideoProvider video={mockVideo}>
          <MockedProvider mocks={[]}>
            <SubtitleEdit subtitle={mockSubtitle} edition={mockEdition} />
          </MockedProvider>
        </VideoProvider>
      </NextIntlClientProvider>
    )

    expect(screen.getByTestId('SubtitleForm')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument()
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
        await user.click(screen.getByRole('checkbox', { name: 'Primary' }))
        await user.click(screen.getByRole('button', { name: 'Update' }))

        await waitFor(() => {
          expect(subtitleEditWithoutFileMock.result).toHaveBeenCalled()
        })
      })

      it('should update without an existing file', async () => {
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
        await user.click(screen.getByRole('checkbox', { name: 'Primary' }))

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
          vttSrc:
            'https://mock.cloudflare-domain.com/1_jf-0-0/editions/edition.id/subtitles/1_jf-0-0_edition.id_529.vtt',
          srtSrc:
            'https://d389zwyrhi20m0.cloudfront.net/529/1_jf-0-0/0-0-JLtib-529-31474.srt',
          primary: true
        })

        render(
          <NextIntlClientProvider locale="en">
            <VideoProvider video={mockVideo}>
              <MockedProvider
                mocks={[
                  getLanguagesMock,
                  deleteR2AssetMock,
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
        await user.click(screen.getByRole('checkbox', { name: 'Primary' }))

        const dropzone = screen.getByTestId('DropZone')
        await user.upload(
          dropzone,
          new File(['subtitle file'], 'subtitle1.vtt', { type: 'text/vtt' })
        )

        await user.click(screen.getByRole('button', { name: 'Update' }))

        await waitFor(() => {
          expect(deleteR2AssetMock.result).toHaveBeenCalled()
        })
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
        await user.click(screen.getByRole('checkbox', { name: 'Primary' }))
        await user.click(screen.getByRole('button', { name: 'Update' }))

        await waitFor(() => {
          expect(subtitleEditWithoutFileMock.result).toHaveBeenCalled()
        })
      })

      it('should update without an existing file', async () => {
        render(
          <NextIntlClientProvider locale="en">
            <VideoProvider video={mockVideo}>
              <MockedProvider
                mocks={[
                  getLanguagesMock,
                  createR2SrtAssetMock,
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
        await user.click(screen.getByRole('checkbox', { name: 'Primary' }))

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
        expect(subtitleEditWithFileMock.result).toHaveBeenCalled()
      })

      it('should update subtitle with an existing file', async () => {
        const subtitleEditWithExistingFileMock = getEditSubtitleMock({
          vttSrc:
            'https://d389zwyrhi20m0.cloudfront.net/529/1_jf-0-0/0-0-JLtib-529-31474.vtt',
          srtSrc:
            'https://mock.cloudflare-domain.com/1_jf-0-0/editions/edition.id/subtitles/1_jf-0-0_edition.id_529.srt',
          primary: true
        })

        render(
          <NextIntlClientProvider locale="en">
            <VideoProvider video={mockVideo}>
              <MockedProvider
                mocks={[
                  getLanguagesMock,
                  deleteR2AssetMock,
                  createR2SrtAssetMock,
                  subtitleEditWithExistingFileMock
                ]}
              >
                <SubtitleEdit
                  subtitle={{
                    ...mockSubtitle,
                    primary: false
                  }}
                  edition={mockEdition}
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
        await user.click(screen.getByRole('checkbox', { name: 'Primary' }))

        const dropzone = screen.getByTestId('DropZone')
        await user.upload(
          dropzone,
          new File(['subtitle file'], 'subtitle1.srt', {
            type: 'application/x-subrip'
          })
        )

        await user.click(screen.getByRole('button', { name: 'Update' }))

        await waitFor(() => {
          expect(deleteR2AssetMock.result).toHaveBeenCalled()
        })
        await waitFor(() => {
          expect(createR2SrtAssetMock.result).toHaveBeenCalled()
        })
        expect(subtitleEditWithExistingFileMock.result).toHaveBeenCalled()
      })
    })
  })
})
