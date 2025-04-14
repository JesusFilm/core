import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GraphQLError } from 'graphql'

import { getLanguagesMock } from '@core/journeys/ui/useLanguagesQuery/useLanguagesQuery.mock'

import { SnackbarProvider } from '../../../../../../../../libs/SnackbarProvider'
import { useAdminVideoMock } from '../../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import { getCreateR2AssetMock } from '../../../../../../../../libs/useCreateR2Asset/useCreateR2Asset.mock'
import { VideoProvider } from '../../../../../../../../libs/VideoProvider'

import {
  CREATE_VIDEO_SUBTITLE,
  CreateVideoSubtitle,
  CreateVideoSubtitleVariables,
  SubtitleCreate
} from '../../../Editions/Subtitles/SubtitleDialog/SubtitleCreate/SubtitleCreate'

const unMockedFetch = global.fetch

const originalCreateObjectURL = global.URL.createObjectURL

global.URL.createObjectURL = jest.fn(() => 'mock-url')

const mockVideo = useAdminVideoMock['result']?.['data']?.['adminVideo']
const mockEdition = mockVideo?.['videoEditions'][0]
const mockEdition2 = mockVideo?.['videoEditions'][1]
const mockSubtitle = mockEdition.videoSubtitles[0]
const mockSubtitle2 = mockEdition2.videoSubtitles[0]
const mockSubtitleLanguagesMap = new Map([
  [mockSubtitle.language.id, mockSubtitle]
])

const mockSubtitleLanguagesMap2 = new Map([
  [mockSubtitle2.language.id, mockSubtitle2]
])

const getCreateSubtitleMock = <
  T extends Partial<CreateVideoSubtitleVariables['input']>
>(
  input: T
): MockedResponse<CreateVideoSubtitle, CreateVideoSubtitleVariables> => ({
  request: {
    query: CREATE_VIDEO_SUBTITLE,
    variables: {
      input: {
        ...input,
        videoId: mockVideo.id,
        edition: 'base',
        languageId: input.languageId ?? '529',
        primary: input.languageId === '529'
      }
    }
  },
  result: jest.fn(() => ({
    data: {
      videoSubtitleCreate: {
        id: 'subtitle1.id',
        edition: 'base',
        vttSrc: input.vttSrc ?? null,
        srtSrc: input.srtSrc ?? null,
        value: input.vttSrc ?? input.srtSrc ?? '',
        primary: input.languageId === '529',
        vttAsset: input.vttSrc ? { id: 'vtt-asset-id' } : null,
        srtAsset: input.srtSrc ? { id: 'srt-asset-id' } : null,
        vttVersion: (input.vttSrc as unknown as number) ?? 0,
        srtVersion: (input.srtSrc as unknown as number) ?? 0,
        language: {
          id: '529',
          name: [{ value: 'English', primary: true }],
          slug: null
        }
      }
    }
  }))
})

describe('SubtitleCreate', () => {
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
    // Restore  original URL.createObjectURL after all tests
    global.URL.createObjectURL = originalCreateObjectURL
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render', () => {
    render(
      <VideoProvider video={mockVideo}>
        <SnackbarProvider>
          <MockedProvider mocks={[]}>
            <SubtitleCreate
              edition={mockEdition}
              close={jest.fn()}
              subtitleLanguagesMap={mockSubtitleLanguagesMap}
            />
          </MockedProvider>
        </SnackbarProvider>
      </VideoProvider>
    )

    expect(screen.getByTestId('SubtitleForm')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
  })

  it('should handle subtitle creation without a file', async () => {
    const createSubtitleMock = getCreateSubtitleMock({
      edition: 'base',
      languageId: '528',
      vttSrc: null,
      srtSrc: null,
      vttAssetId: null,
      srtAssetId: null,
      vttVersion: 0,
      srtVersion: 0
    })

    render(
      <VideoProvider video={mockVideo}>
        <MockedProvider mocks={[getLanguagesMock, createSubtitleMock]}>
          <SubtitleCreate
            edition={mockEdition}
            close={jest.fn()}
            subtitleLanguagesMap={mockSubtitleLanguagesMap}
          />
        </MockedProvider>
      </VideoProvider>
    )

    const user = userEvent.setup()

    const select = screen.getByRole('combobox', { name: 'Language' })
    await user.click(select)
    await waitFor(async () => {
      await user.click(screen.getByRole('option', { name: 'Spanish' }))
    })
    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => {
      expect(createSubtitleMock.result).toHaveBeenCalled()
    })
  })

  it('should prevent creating a subtitle with a language that already exists', async () => {
    const close = jest.fn()

    render(
      <SnackbarProvider>
        <VideoProvider video={mockVideo}>
          <MockedProvider mocks={[getLanguagesMock]}>
            <SubtitleCreate
              edition={mockEdition}
              close={close}
              subtitleLanguagesMap={mockSubtitleLanguagesMap}
            />
          </MockedProvider>
        </VideoProvider>
      </SnackbarProvider>
    )

    const user = userEvent.setup()

    // Try to select the language that already has a subtitle
    const select = screen.getByRole('combobox', { name: 'Language' })
    await user.click(select)

    // The language that already has a subtitle should not be in the dropdown
    await waitFor(() => {
      expect(
        screen.queryByRole('option', {
          name: mockSubtitle.language.name[0].value
        })
      ).not.toBeInTheDocument()
    })
  })

  it('should handle subtitle creation with a vtt file', async () => {
    const createSubtitleMock = getCreateSubtitleMock({
      vttSrc:
        'https://mock.cloudflare-domain.com/1_jf-0-0/editions/edition.id/subtitles/1_jf-0-0_edition.id_528.vtt',
      srtSrc: null,
      vttAssetId: 'r2-asset.id',
      srtAssetId: null,
      vttVersion: 1,
      srtVersion: 0,
      languageId: '528'
    })
    const createR2SubtitleAssetMock = getCreateR2AssetMock({
      videoId: mockVideo.id,
      contentType: 'text/vtt',
      fileName:
        '1_jf-0-0/editions/edition.id/subtitles/1_jf-0-0_edition.id_528.vtt',
      contentLength: 13
    })

    render(
      <VideoProvider video={mockVideo}>
        <MockedProvider
          mocks={[
            getLanguagesMock,
            createR2SubtitleAssetMock,
            createSubtitleMock
          ]}
        >
          <SubtitleCreate
            edition={mockEdition}
            close={jest.fn()}
            subtitleLanguagesMap={mockSubtitleLanguagesMap}
          />
        </MockedProvider>
      </VideoProvider>
    )

    const user = userEvent.setup()

    const select = screen.getByRole('combobox', { name: 'Language' })
    await user.click(select)
    await waitFor(async () => {
      await user.click(screen.getByRole('option', { name: 'Spanish' }))
    })

    const dropzone = screen.getByTestId('DropZone')
    await user.upload(
      dropzone,
      new File(['subtitle file'], 'subtitle1.vtt', { type: 'text/vtt' })
    )

    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => {
      expect(createR2SubtitleAssetMock.result).toHaveBeenCalled()
    })
    expect(createSubtitleMock.result).toHaveBeenCalled()
  })

  it('should handle subtitle creation with a srt file', async () => {
    const createSubtitleMock = getCreateSubtitleMock({
      languageId: '528',
      primary: false,
      vttSrc: null,
      srtSrc:
        'https://mock.cloudflare-domain.com/1_jf-0-0/editions/edition.id/subtitles/1_jf-0-0_edition.id_528.srt',
      vttAssetId: null,
      srtAssetId: 'r2-asset.id',
      vttVersion: 0,
      srtVersion: 1
    })
    const createR2SubtitleAssetMock = getCreateR2AssetMock({
      videoId: mockVideo.id,
      contentType: 'application/x-subrip',
      fileName:
        '1_jf-0-0/editions/edition.id/subtitles/1_jf-0-0_edition.id_528.srt',
      contentLength: 13
    })

    render(
      <VideoProvider video={mockVideo}>
        <MockedProvider
          mocks={[
            getLanguagesMock,
            createR2SubtitleAssetMock,
            createSubtitleMock
          ]}
        >
          <SubtitleCreate
            edition={mockEdition}
            close={jest.fn()}
            subtitleLanguagesMap={mockSubtitleLanguagesMap}
          />
        </MockedProvider>
      </VideoProvider>
    )

    const user = userEvent.setup()

    const select = screen.getByRole('combobox', { name: 'Language' })
    await user.click(select)
    await waitFor(async () => {
      await user.click(screen.getByRole('option', { name: 'Spanish' }))
    })

    const dropzone = screen.getByTestId('DropZone')
    await user.upload(
      dropzone,
      new File(['subtitle file'], 'subtitle1.srt', {
        type: 'application/x-subrip'
      })
    )

    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => {
      expect(createR2SubtitleAssetMock.result).toHaveBeenCalled()
    })
    expect(createSubtitleMock.result).toHaveBeenCalled()
  })

  it('should handle subtitle creation with both vtt and srt files simultaneously', async () => {
    const createSubtitleMock = getCreateSubtitleMock({
      languageId: '528',
      primary: false,
      vttSrc:
        'https://mock.cloudflare-domain.com/1_jf-0-0/editions/edition.id/subtitles/1_jf-0-0_edition.id_528.vtt',
      srtSrc:
        'https://mock.cloudflare-domain.com/1_jf-0-0/editions/edition.id/subtitles/1_jf-0-0_edition.id_528.srt',
      vttAssetId: 'r2-asset.id',
      srtAssetId: 'r2-asset.id',
      vttVersion: 1,
      srtVersion: 1
    })

    const createR2VttAssetMock = getCreateR2AssetMock({
      videoId: mockVideo.id,
      contentType: 'text/vtt',
      fileName:
        '1_jf-0-0/editions/edition.id/subtitles/1_jf-0-0_edition.id_528.vtt',
      contentLength: 17
    })

    const createR2SrtAssetMock = getCreateR2AssetMock({
      videoId: mockVideo.id,
      contentType: 'application/x-subrip',
      fileName:
        '1_jf-0-0/editions/edition.id/subtitles/1_jf-0-0_edition.id_528.srt',
      contentLength: 17
    })

    render(
      <VideoProvider video={mockVideo}>
        <MockedProvider
          mocks={[
            getLanguagesMock,
            createR2VttAssetMock,
            createR2SrtAssetMock,
            createSubtitleMock
          ]}
        >
          <SubtitleCreate
            edition={mockEdition}
            close={jest.fn()}
            subtitleLanguagesMap={mockSubtitleLanguagesMap}
          />
        </MockedProvider>
      </VideoProvider>
    )

    const user = userEvent.setup()

    const select = screen.getByRole('combobox', { name: 'Language' })
    await user.click(select)
    await waitFor(async () => {
      await user.click(screen.getByRole('option', { name: 'Spanish' }))
    })

    const dropzone = screen.getByTestId('DropZone')

    // Upload VTT file
    await user.upload(
      dropzone,
      new File(['subtitle vtt file'], 'subtitle1.vtt', { type: 'text/vtt' })
    )

    // Upload SRT file
    await user.upload(
      dropzone,
      new File(['subtitle srt file'], 'subtitle1.srt', {
        type: 'application/x-subrip'
      })
    )

    expect(screen.getByText('subtitle1.vtt')).toBeInTheDocument()
    expect(screen.getByText('subtitle1.srt')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => {
      expect(createR2VttAssetMock.result).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(createR2SrtAssetMock.result).toHaveBeenCalled()
    })
    expect(createSubtitleMock.result).toHaveBeenCalled()
  })

  it('should not create subtitle if asset was not created', async () => {
    const createSubtitleMock = getCreateSubtitleMock({
      vttSrc: null,
      srtSrc:
        'https://mock.cloudflare-domain.com/1_jf-0-0/editions/edition.id/subtitles/1_jf-0-0_edition.id_528.srt',
      primary: false,
      languageId: '528'
    })

    const createR2SubtitleAssetMock = getCreateR2AssetMock({
      videoId: mockVideo.id,
      contentType: 'application/x-subrip',
      fileName:
        '1_jf-0-0/editions/edition.id/subtitles/1_jf-0-0_edition.id_528.srt',
      contentLength: 13
    })

    const createR2AssetErrorMock = {
      ...createR2SubtitleAssetMock,
      result: {
        errors: [
          new GraphQLError('Unexpected error', {
            extensions: { code: 'DOWNSTREAM_SERVICE_ERROR' }
          })
        ]
      }
    }

    render(
      <SnackbarProvider>
        <VideoProvider video={mockVideo}>
          <MockedProvider
            mocks={[
              getLanguagesMock,
              createR2AssetErrorMock,
              createSubtitleMock
            ]}
          >
            <SubtitleCreate
              edition={mockEdition}
              close={jest.fn()}
              subtitleLanguagesMap={mockSubtitleLanguagesMap}
            />
          </MockedProvider>
        </VideoProvider>
      </SnackbarProvider>
    )

    const user = userEvent.setup()

    const select = screen.getByRole('combobox', { name: 'Language' })
    await user.click(select)
    await waitFor(async () => {
      await user.click(screen.getByRole('option', { name: 'Spanish' }))
    })

    const dropzone = screen.getByTestId('DropZone')
    await user.upload(
      dropzone,
      new File(['subtitle file'], 'subtitle1.srt', {
        type: 'application/x-subrip'
      })
    )

    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() =>
      expect(screen.getByText('Failed to create subtitle.')).toBeInTheDocument()
    )
    expect(createSubtitleMock.result).not.toHaveBeenCalled()
  })

  it('should set primary to true when English language is selected', async () => {
    const createSubtitleMock = getCreateSubtitleMock({
      vttSrc: null,
      srtSrc: null,
      languageId: '529',
      vttAssetId: null,
      srtAssetId: null,
      vttVersion: 0,
      srtVersion: 0
    })

    render(
      <VideoProvider video={mockVideo}>
        <MockedProvider mocks={[getLanguagesMock, createSubtitleMock]}>
          <SubtitleCreate
            edition={mockEdition2}
            close={jest.fn()}
            subtitleLanguagesMap={mockSubtitleLanguagesMap2}
          />
        </MockedProvider>
      </VideoProvider>
    )

    const user = userEvent.setup()
    const select = screen.getByRole('combobox', { name: 'Language' })
    await user.click(select)
    await waitFor(async () => {
      await user.click(screen.getByRole('option', { name: 'English' }))
    })
    await user.click(screen.getByRole('button', { name: 'Create' }))
    // Verify that primary was set to true in the mutation
    await waitFor(() => {
      expect(createSubtitleMock.result).toHaveBeenCalledWith({
        input: expect.objectContaining({ primary: true })
      })
    })
  })
})
