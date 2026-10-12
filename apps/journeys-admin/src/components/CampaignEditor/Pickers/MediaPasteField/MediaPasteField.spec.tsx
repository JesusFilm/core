import { MockedProvider } from '@apollo/client/testing/react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReactElement } from 'react'
import { SWRConfig } from 'swr'

import { useEditor } from '@core/journeys/ui/EditorProvider'

import {
  VideoBlockSource,
  VideoLabel
} from '../../../../../__generated__/globalTypes'
import { mswServer } from '../../../../../test/mswServer'
import { GET_CAMPAIGN_WATCH_VIDEO } from '../../../../libs/useCampaignWatchVideoQuery'
import { useImageUpload } from '../../../../libs/useImageUpload'
import type { UseImageUploadOptions } from '../../../../libs/useImageUpload'
import { getVideosWithOffsetAndUrl } from '../../../Editor/Slider/Settings/Drawer/VideoLibrary/VideoFromYouTube/VideoFromYouTube.handlers'

import { MediaPasteField } from './MediaPasteField'

vi.mock('../../../../libs/useImageUpload', () => ({
  useImageUpload: vi.fn()
}))

/** The video library's Mux upload as a stub: shows the task key it uploads under and finishes on click. */
vi.mock(
  '../../../Editor/Slider/Settings/Drawer/VideoLibrary/VideoFromMux/AddByFile',
  () => ({
    AddByFile: ({
      onChange
    }: {
      onChange: (id: string) => void
    }): ReactElement => {
      const {
        state: { selectedBlock }
      } = useEditor()
      return (
        <button type="button" onClick={() => onChange('muxVideoId')}>
          {`Upload under ${selectedBlock?.id ?? ''}`}
        </button>
      )
    }
  })
)

const WATCH_URL =
  'https://www.jesusfilm.org/watch/easter.html/the-resurrection/english.html'
const WATCH_SLUG = 'the-resurrection/english'
const YOUTUBE_URL = 'https://youtu.be/jQaeIJOA6J0'

function watchVideoMock(childrenCount: number) {
  return {
    request: { query: GET_CAMPAIGN_WATCH_VIDEO, variables: { id: WATCH_SLUG } },
    result: vi.fn(() => ({
      data: {
        video: {
          __typename: 'Video',
          id: 'watchVideoId',
          label:
            childrenCount > 0 ? VideoLabel.collection : VideoLabel.shortFilm,
          childrenCount,
          title: [{ __typename: 'VideoTitle', value: 'The Resurrection' }],
          images: [
            {
              __typename: 'CloudflareImage',
              mobileCinematicHigh: 'https://imagedelivery.net/poster.jpg'
            }
          ],
          variant: {
            __typename: 'VideoVariant',
            id: 'variantId',
            duration: 125
          }
        }
      }
    }))
  }
}

const watchErrorMock = {
  request: { query: GET_CAMPAIGN_WATCH_VIDEO, variables: { id: WATCH_SLUG } },
  error: new Error('video not found')
}

let uploadOptions: UseImageUploadOptions | undefined

function renderField(
  mocks: Array<Record<string, unknown>> = []
): ReturnType<typeof vi.fn> {
  const onPick = vi.fn()
  render(
    <MockedProvider mocks={mocks as never}>
      <SWRConfig value={{ provider: () => new Map() }}>
        <MediaPasteField teamId="teamId" uploadKey="heroId" onPick={onPick} />
      </SWRConfig>
    </MockedProvider>
  )
  return onPick
}

function paste(value: string): void {
  fireEvent.change(
    screen.getByRole('textbox', { name: 'Watch or YouTube link' }),
    { target: { value } }
  )
}

describe('MediaPasteField', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    uploadOptions = undefined
    vi.mocked(useImageUpload).mockImplementation((options) => {
      uploadOptions = options
      return {
        getRootProps: () => ({}),
        getInputProps: () => ({}),
        open: vi.fn(),
        loading: false,
        isDragAccept: false
      } as unknown as ReturnType<typeof useImageUpload>
    })
  })

  it('offers a pasted link, an upload or an image, and no library browsing', () => {
    renderField()

    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'Paste a link',
      'Upload',
      'Image'
    ])
    expect(screen.queryByText(/library/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: /search/i })).toBeNull()
  })

  it('checks the Watch or YouTube shape client-side before offering a preview', () => {
    const onPick = renderField()

    paste('https://vimeo.com/123456')

    expect(
      screen.getByText('Paste a jesusfilm.org/watch or YouTube video link')
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Preview' })).toBeDisabled()
    fireEvent.keyDown(
      screen.getByRole('textbox', { name: 'Watch or YouTube link' }),
      { key: 'Enter' }
    )
    expect(screen.queryByRole('button', { name: 'Use video' })).toBeNull()
    expect(onPick).not.toHaveBeenCalled()
  })

  it('resolves a Watch link by its variant slug and shows its title, label and children count before it is kept', async () => {
    const watchMock = watchVideoMock(12)
    const onPick = renderField([watchMock])

    paste(WATCH_URL)
    fireEvent.click(screen.getByRole('button', { name: 'Preview' }))

    const resolved = await screen.findByTestId(
      'CampaignMediaPasteFieldResolved'
    )
    expect(resolved).toHaveTextContent('The Resurrection')
    expect(resolved).toHaveTextContent('Collection · 12 videos')
    expect(watchMock.result).toHaveBeenCalled()
    expect(onPick).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Use video' }))

    expect(onPick).toHaveBeenCalledWith({
      source: VideoBlockSource.internal,
      url: WATCH_URL
    })
  })

  it('shows the duration of a Watch video without children', async () => {
    renderField([watchVideoMock(0)])

    paste(WATCH_URL)
    fireEvent.click(screen.getByRole('button', { name: 'Preview' }))

    expect(
      await screen.findByTestId('CampaignMediaPasteFieldResolved')
    ).toHaveTextContent('Short film · 2:05')
  })

  it('shows the gateway’s error verbatim and keeps nothing', async () => {
    const onPick = renderField([watchErrorMock])

    paste(WATCH_URL)
    fireEvent.click(screen.getByRole('button', { name: 'Preview' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'video not found'
    )
    expect(screen.getByRole('button', { name: 'Use video' })).toBeDisabled()
    expect(onPick).not.toHaveBeenCalled()
  })

  it('resolves a YouTube link as the video library does and picks its id', async () => {
    mswServer.use(getVideosWithOffsetAndUrl)
    const onPick = renderField()

    paste(YOUTUBE_URL)
    fireEvent.click(screen.getByRole('button', { name: 'Preview' }))

    const resolved = await screen.findByTestId(
      'CampaignMediaPasteFieldResolved'
    )
    expect(resolved).toHaveTextContent('Blessing and Curse')
    expect(resolved).toHaveTextContent('YouTube · 6:03')

    fireEvent.click(screen.getByRole('button', { name: 'Use video' }))

    expect(onPick).toHaveBeenCalledWith({
      source: VideoBlockSource.youTube,
      videoId: 'jQaeIJOA6J0'
    })
  })

  it('uploads through the video library’s Mux upload under the slot’s section and picks the Mux video when it is ready', () => {
    const onPick = renderField()

    fireEvent.click(screen.getByRole('tab', { name: 'Upload' }))
    fireEvent.click(screen.getByRole('button', { name: 'Upload under heroId' }))

    expect(onPick).toHaveBeenCalledWith({
      source: VideoBlockSource.mux,
      videoId: 'muxVideoId'
    })
  })

  it('picks an image through the image picker under the team', async () => {
    const onPick = renderField()

    fireEvent.click(screen.getByRole('tab', { name: 'Image' }))
    expect(uploadOptions?.teamId).toBe('teamId')
    act(() => {
      uploadOptions?.onUploadComplete?.(
        'https://imagedelivery.net/hash/cfId/public'
      )
    })
    fireEvent.click(await screen.findByRole('button', { name: 'Use image' }))

    await waitFor(() =>
      expect(onPick).toHaveBeenCalledWith({
        src: 'https://imagedelivery.net/hash/cfId/public'
      })
    )
  })
})
