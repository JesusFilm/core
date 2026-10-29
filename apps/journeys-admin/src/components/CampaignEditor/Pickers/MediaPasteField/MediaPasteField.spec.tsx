import { MockLink } from '@apollo/client/testing'
import { MockedProvider } from '@apollo/client/testing/react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { http } from 'msw'
import { ReactElement } from 'react'
import { SWRConfig } from 'swr'

import {
  VideoBlockSource,
  VideoLabel
} from '../../../../../__generated__/globalTypes'
import { mswServer } from '../../../../../test/mswServer'
import { GET_CAMPAIGN_WATCH_VIDEO } from '../../../../libs/useCampaignWatchVideoQuery'
import { useImageUpload } from '../../../../libs/useImageUpload'
import type { UseImageUploadOptions } from '../../../../libs/useImageUpload'
import { GET_MY_MUX_VIDEOS } from '../../../Editor/Slider/Settings/Drawer/VideoLibrary/VideoFromMux/MyMuxVideos'
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
      onChange,
      uploadKey
    }: {
      onChange: (id: string) => void
      uploadKey?: string
    }): ReactElement => (
      <button type="button" onClick={() => onChange('muxVideoId')}>
        {`Upload under ${uploadKey ?? ''}`}
      </button>
    )
  })
)

const WATCH_URL =
  'https://www.jesusfilm.org/watch/hope.html/the-resurrection/english.html'
const WATCH_SLUG = 'the-resurrection/english'
const YOUTUBE_URL = 'https://youtu.be/jQaeIJOA6J0'
const PLAYLIST_URL =
  'https://www.youtube.com/playlist?list=PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG'

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
          description: [],
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

const muxUploadsMock = {
  request: {
    query: GET_MY_MUX_VIDEOS,
    variables: { offset: 0, limit: 11, teamId: 'teamId' }
  },
  result: {
    data: {
      getMyMuxVideos: [
        {
          __typename: 'MuxVideo',
          id: 'earlierMuxId',
          playbackId: 'playbackId',
          readyToStream: true,
          duration: 42,
          userId: 'userId'
        },
        {
          __typename: 'MuxVideo',
          id: 'processingMuxId',
          playbackId: null,
          readyToStream: false,
          duration: null,
          userId: 'userId'
        }
      ]
    }
  }
}

const getPlaylist = http.get(
  'https://www.googleapis.com/youtube/v3/playlists',
  () =>
    new Response(
      JSON.stringify({
        items: [
          {
            snippet: { title: 'Advent readings', thumbnails: {} },
            contentDetails: { itemCount: 40 }
          }
        ]
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
)

let uploadOptions: UseImageUploadOptions | undefined

function renderField(
  mocks: MockLink.MockedResponse[] = [],
  onPickPlaylist?: (url: string) => void
): ReturnType<typeof vi.fn> {
  const onPick = vi.fn()
  render(
    <MockedProvider mocks={mocks}>
      <SWRConfig value={{ provider: () => new Map() }}>
        <MediaPasteField
          teamId="teamId"
          uploadKey="heroId"
          onPick={onPick}
          onPickPlaylist={onPickPlaylist}
        />
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

    fireEvent.click(screen.getByRole('button', { name: 'Use collection' }))

    expect(onPick).toHaveBeenCalledWith(
      { source: VideoBlockSource.internal, url: WATCH_URL },
      expect.objectContaining({ childrenCount: 12 })
    )
  })

  it('falls back to the container/child reading of a two-part Watch address', async () => {
    const url =
      'https://www.jesusfilm.org/watch/hope.html/the-resurrection.html'
    const firstReadingMock = {
      request: {
        query: GET_CAMPAIGN_WATCH_VIDEO,
        variables: { id: 'hope/the-resurrection' }
      },
      error: new Error('Video not found with id slug:hope/the-resurrection')
    }
    const watchMock = watchVideoMock(0)
    const onPick = renderField([firstReadingMock, watchMock])

    paste(url)
    fireEvent.click(screen.getByRole('button', { name: 'Preview' }))

    const resolved = await screen.findByTestId(
      'CampaignMediaPasteFieldResolved'
    )
    expect(resolved).toHaveTextContent('The Resurrection')
    expect(watchMock.result).toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Use video' }))

    expect(onPick).toHaveBeenCalledWith(
      { source: VideoBlockSource.internal, url },
      expect.objectContaining({ childrenCount: 0 })
    )
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

    expect(onPick).toHaveBeenCalledWith(
      { source: VideoBlockSource.youTube, videoId: 'jQaeIJOA6J0' },
      expect.objectContaining({ childrenCount: 0 })
    )
  })

  it('previews a long YouTube playlist with how many of its videos an import brings in', async () => {
    mswServer.use(getPlaylist)
    const onPickPlaylist = vi.fn()
    renderField([], onPickPlaylist)

    fireEvent.change(
      screen.getByRole('textbox', {
        name: 'Watch, YouTube video or playlist link'
      }),
      { target: { value: PLAYLIST_URL } }
    )
    fireEvent.click(screen.getByRole('button', { name: 'Preview' }))

    expect(
      await screen.findByText('YouTube playlist · First 12 of 40 videos')
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Add videos' }))

    expect(onPickPlaylist).toHaveBeenCalledWith(PLAYLIST_URL)
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

  it("lists the team's earlier Mux uploads under Upload, ready ones only, and picks one at once", async () => {
    const onPick = renderField([muxUploadsMock])
    fireEvent.click(screen.getByRole('tab', { name: 'Upload' }))

    fireEvent.click(
      await screen.findByTestId('CampaignMuxUploads-earlierMuxId')
    )

    expect(
      screen.queryByTestId('CampaignMuxUploads-processingMuxId')
    ).toBeNull()
    expect(onPick).toHaveBeenCalledWith({
      source: VideoBlockSource.mux,
      videoId: 'earlierMuxId'
    })
  })
})
