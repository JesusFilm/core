import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'

import { getLanguagesMock } from '@core/journeys/ui/useLanguagesQuery/useLanguagesQuery.mock'

import { useAdminVideoMock } from '../../../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import { getCreateR2AssetMock } from '../../../../../../../../../../libs/useCreateR2Asset/useCreateR2Asset.mock'
import { VideoProvider } from '../../../../../../../../../../libs/VideoProvider'

import {
  CREATE_VIDEO_SUBTITLE,
  CreateVideoSubtitle,
  CreateVideoSubtitleVariables,
  SubtitleCreate
} from './SubtitleCreate'

const unMockedFetch = global.fetch

const mockVideo = useAdminVideoMock['result']?.['data']?.['adminVideo']
const mockEdition = mockVideo?.['videoEditions'][0]

type CreateSubtitleInput = Pick<
  CreateVideoSubtitleVariables['input'],
  'vttSrc' | 'srtSrc' | 'primary'
>

const getCreateSubtitleMock = <T extends CreateSubtitleInput>(
  input: T
): MockedResponse<CreateVideoSubtitle, CreateVideoSubtitleVariables> => ({
  request: {
    query: CREATE_VIDEO_SUBTITLE,
    variables: {
      input: {
        ...input,
        videoId: mockVideo.id,
        edition: 'base',
        languageId: '529'
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
        primary: input.primary,
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
  })

  it('should render', () => {
    render(
      <NextIntlClientProvider locale="en">
        <VideoProvider video={mockVideo}>
          <MockedProvider mocks={[]}>
            <SubtitleCreate edition={mockEdition} close={jest.fn()} />
          </MockedProvider>
        </VideoProvider>
      </NextIntlClientProvider>
    )

    expect(screen.getByTestId('SubtitleForm')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
  })

  it('should handle subtitle creation without a file', async () => {
    const createSubtitleMock = getCreateSubtitleMock({
      vttSrc: null,
      srtSrc: null,
      primary: true
    })

    render(
      <NextIntlClientProvider locale="en">
        <VideoProvider video={mockVideo}>
          <MockedProvider mocks={[getLanguagesMock, createSubtitleMock]}>
            <SubtitleCreate edition={mockEdition} close={jest.fn()} />
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
    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => {
      expect(createSubtitleMock.result).toHaveBeenCalled()
    })
  })

  it('should handle subtitle creation with a vtt file', async () => {
    const createSubtitleMock = getCreateSubtitleMock({
      vttSrc:
        'https://mock.cloudflare-domain.com/1_jf-0-0/editions/edition.id/subtitles/1_jf-0-0_edition.id_529.vtt',
      srtSrc: null,
      primary: true
    })
    const createR2SubtitleAssetMock = getCreateR2AssetMock({
      videoId: mockVideo.id,
      contentType: 'text/vtt',
      fileName:
        '1_jf-0-0/editions/edition.id/subtitles/1_jf-0-0_edition.id_529.vtt',
      contentLength: 13
    })

    render(
      <NextIntlClientProvider locale="en">
        <VideoProvider video={mockVideo}>
          <MockedProvider
            mocks={[
              getLanguagesMock,
              createR2SubtitleAssetMock,
              createSubtitleMock
            ]}
          >
            <SubtitleCreate edition={mockEdition} close={jest.fn()} />
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

    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => {
      expect(createR2SubtitleAssetMock.result).toHaveBeenCalled()
    })
    expect(createSubtitleMock.result).toHaveBeenCalled()
  })

  it('should handle subtitle creation with a srt file', async () => {
    const createSubtitleMock = getCreateSubtitleMock({
      vttSrc: null,
      srtSrc:
        'https://mock.cloudflare-domain.com/1_jf-0-0/editions/edition.id/subtitles/1_jf-0-0_edition.id_529.srt',
      primary: true
    })
    const createR2SubtitleAssetMock = getCreateR2AssetMock({
      videoId: mockVideo.id,
      contentType: 'application/x-subrip',
      fileName:
        '1_jf-0-0/editions/edition.id/subtitles/1_jf-0-0_edition.id_529.srt',
      contentLength: 13
    })

    render(
      <NextIntlClientProvider locale="en">
        <VideoProvider video={mockVideo}>
          <MockedProvider
            mocks={[
              getLanguagesMock,
              createR2SubtitleAssetMock,
              createSubtitleMock
            ]}
          >
            <SubtitleCreate edition={mockEdition} close={jest.fn()} />
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

    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => {
      expect(createR2SubtitleAssetMock.result).toHaveBeenCalled()
    })
    expect(createSubtitleMock.result).toHaveBeenCalled()
  })
})
