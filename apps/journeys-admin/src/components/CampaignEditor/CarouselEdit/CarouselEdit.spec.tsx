import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { http } from 'msw'
import { ReactElement } from 'react'
import { SWRConfig } from 'swr'

import { youTubeVideoBlock } from '@core/journeys/ui/Campaign/testData'
import { useEditor } from '@core/journeys/ui/EditorProvider'

import {
  GetCampaign_campaign_blocks_CampaignVideoCarouselBlock as CarouselBlock,
  GetCampaign_campaign_blocks
} from '../../../../__generated__/GetCampaign'
import {
  VideoBlockSource,
  VideoLabel
} from '../../../../__generated__/globalTypes'
import { mswServer } from '../../../../test/mswServer'
import { CAMPAIGN_VIDEO_BLOCK_CREATE } from '../../../libs/useCampaignVideoBlockCreateMutation'
import { CAMPAIGN_VIDEO_CAROUSEL_BLOCK_PLAYLIST_IMPORT } from '../../../libs/useCampaignVideoCarouselBlockPlaylistImportMutation'
import { CAMPAIGN_VIDEO_CAROUSEL_BLOCK_UPDATE_VIDEO } from '../../../libs/useCampaignVideoCarouselBlockUpdateMutation'
import { GET_CAMPAIGN_WATCH_VIDEO } from '../../../libs/useCampaignWatchVideoQuery'
import { getVideosWithOffsetAndUrl } from '../../Editor/Slider/Settings/Drawer/VideoLibrary/VideoFromYouTube/VideoFromYouTube.handlers'
import { campaign } from '../data'
import { CommandProbe, StaticEditor } from '../testing'

import { CarouselEdit } from './CarouselEdit'

vi.mock('uuid', () => ({ v4: vi.fn(() => 'newItemId') }))

vi.mock(
  '../../Editor/Slider/Settings/Drawer/VideoLibrary/VideoFromMux/AddByFile',
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
  'https://www.jesusfilm.org/watch/christmas.html/the-nativity/english.html'
const WATCH_SLUG = 'the-nativity/english'
const YOUTUBE_URL = 'https://youtu.be/jQaeIJOA6J0'
const PLAYLIST_URL =
  'https://www.youtube.com/playlist?list=PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG'

const carousel = campaign.blocks.find(
  (block) => block.id === 'carouselId'
) as CarouselBlock

const expandedCarousel: CarouselBlock = {
  ...carousel,
  videoId: 'collectionId',
  videoVariantLanguageId: '529',
  video: {
    __typename: 'Video',
    id: 'collectionId',
    label: VideoLabel.collection,
    slug: 'christmas',
    childrenCount: 8,
    title: [
      {
        __typename: 'VideoTitle',
        value: 'Christmas films',
        primary: true,
        language: { __typename: 'Language', id: '529' }
      }
    ],
    images: [],
    variant: null,
    children: []
  }
}

const watchMock = {
  request: { query: GET_CAMPAIGN_WATCH_VIDEO, variables: { id: WATCH_SLUG } },
  result: {
    data: {
      video: {
        __typename: 'Video',
        id: 'collectionId',
        label: VideoLabel.collection,
        childrenCount: 8,
        title: [{ __typename: 'VideoTitle', value: 'Christmas films' }],
        images: [],
        variant: null
      }
    }
  }
}

const setWatchMock = {
  request: {
    query: CAMPAIGN_VIDEO_CAROUSEL_BLOCK_UPDATE_VIDEO,
    variables: { id: 'carouselId', input: { url: WATCH_URL } }
  },
  result: vi.fn(() => ({
    data: { campaignVideoCarouselBlockUpdate: expandedCarousel }
  }))
}

const clearWatchMock = {
  request: {
    query: CAMPAIGN_VIDEO_CAROUSEL_BLOCK_UPDATE_VIDEO,
    variables: { id: 'carouselId', input: { videoId: null } }
  },
  result: vi.fn(() => ({
    data: { campaignVideoCarouselBlockUpdate: carousel }
  }))
}

function item(
  overrides: Partial<GetCampaign_campaign_blocks>
): GetCampaign_campaign_blocks {
  return {
    ...youTubeVideoBlock,
    id: 'newItemId',
    parentBlockId: 'carouselId',
    parentOrder: 0,
    ...overrides
  } as GetCampaign_campaign_blocks
}

const youTubeItemMock = {
  request: {
    query: CAMPAIGN_VIDEO_BLOCK_CREATE,
    variables: {
      input: {
        id: 'newItemId',
        campaignId: 'campaignId',
        parentBlockId: 'carouselId',
        source: VideoBlockSource.youTube,
        videoId: 'jQaeIJOA6J0'
      }
    }
  },
  result: vi.fn(() => ({ data: { campaignVideoBlockCreate: item({}) } }))
}

const muxItemMock = {
  request: {
    query: CAMPAIGN_VIDEO_BLOCK_CREATE,
    variables: {
      input: {
        id: 'newItemId',
        campaignId: 'campaignId',
        parentBlockId: 'carouselId',
        source: VideoBlockSource.mux,
        videoId: 'muxVideoId'
      }
    }
  },
  result: vi.fn(() => ({
    data: {
      campaignVideoBlockCreate: item({
        source: VideoBlockSource.mux,
        videoId: 'muxVideoId',
        mediaVideo: null
      })
    }
  }))
}

const playlistMock = {
  request: {
    query: CAMPAIGN_VIDEO_CAROUSEL_BLOCK_PLAYLIST_IMPORT,
    variables: { id: 'carouselId', url: PLAYLIST_URL }
  },
  result: vi.fn(() => ({
    data: {
      campaignVideoCarouselBlockPlaylistImport: Array.from(
        { length: 12 },
        (_, index) => item({ id: `playlistItem${index}`, parentOrder: index })
      )
    }
  }))
}

const getPlaylist = http.get(
  'https://www.googleapis.com/youtube/v3/playlists',
  () =>
    new Response(
      JSON.stringify({
        items: [
          {
            snippet: {
              title: 'Advent readings',
              thumbnails: { high: { url: 'https://i.ytimg.com/advent.jpg' } }
            },
            contentDetails: { itemCount: 30 }
          }
        ]
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
)

function renderEdit(block: CarouselBlock = carousel): void {
  render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <StaticEditor
        campaignProp={{
          ...campaign,
          blocks: campaign.blocks.map((candidate) =>
            candidate.id === block.id ? block : candidate
          )
        }}
        mocks={[
          watchMock,
          setWatchMock,
          clearWatchMock,
          youTubeItemMock,
          muxItemMock,
          playlistMock
        ]}
      >
        <CommandProbe />
        <CarouselEdit block={block} />
      </StaticEditor>
    </SWRConfig>
  )
}

function paste(value: string): void {
  fireEvent.change(
    screen.getByRole('textbox', {
      name: 'Watch, YouTube video or playlist link'
    }),
    { target: { value } }
  )
  fireEvent.click(screen.getByRole('button', { name: 'Preview' }))
}

describe('CarouselEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('offers a pasted link or an upload, and no image', () => {
    renderEdit()

    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'Paste a link',
      'Upload'
    ])
  })

  it('shows a pasted Watch link resolved, then sets the Watch expansion as one Command', async () => {
    renderEdit()

    paste(WATCH_URL)
    const resolved = await screen.findByTestId(
      'CampaignCarouselPasteFieldResolved'
    )
    expect(resolved).toHaveTextContent('Christmas films')
    expect(resolved).toHaveTextContent('Collection · 8 videos')
    expect(setWatchMock.result).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Use video' }))

    await waitFor(() => expect(setWatchMock.result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
  })

  it('adds a pasted YouTube video as one explicit item', async () => {
    mswServer.use(getVideosWithOffsetAndUrl)
    renderEdit()

    paste(YOUTUBE_URL)
    const resolved = await screen.findByTestId(
      'CampaignCarouselPasteFieldResolved'
    )
    expect(resolved).toHaveTextContent('YouTube · 6:03')

    fireEvent.click(screen.getByRole('button', { name: 'Use video' }))

    await waitFor(() => expect(youTubeItemMock.result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
  })

  it('shows a pasted YouTube playlist resolved, then imports its first 12 videos as one Command', async () => {
    mswServer.use(getPlaylist)
    renderEdit()

    paste(PLAYLIST_URL)
    const resolved = await screen.findByTestId(
      'CampaignCarouselPasteFieldResolved'
    )
    expect(resolved).toHaveTextContent('Advent readings')
    expect(resolved).toHaveTextContent(
      'YouTube playlist · First 12 of 30 videos'
    )
    expect(playlistMock.result).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Add videos' }))

    await waitFor(() => expect(playlistMock.result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
  })

  it('adds an uploaded video as one explicit item', async () => {
    renderEdit()

    fireEvent.click(screen.getByRole('tab', { name: 'Upload' }))
    fireEvent.click(
      screen.getByRole('button', { name: 'Upload under carouselId' })
    )

    await waitFor(() => expect(muxItemMock.result).toHaveBeenCalled())
  })

  it('switches an expanded carousel to explicit mode before adding an item', async () => {
    mswServer.use(getVideosWithOffsetAndUrl)
    renderEdit(expandedCarousel)

    paste(YOUTUBE_URL)
    await screen.findByTestId('CampaignCarouselPasteFieldResolved')
    fireEvent.click(screen.getByRole('button', { name: 'Use video' }))

    await waitFor(() => expect(youTubeItemMock.result).toHaveBeenCalled())
    expect(clearWatchMock.result).toHaveBeenCalled()
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
  })

  it('shows the expanded Watch video and switches to explicit mode with "Use my own videos"', async () => {
    renderEdit(expandedCarousel)

    expect(screen.getByTestId('CampaignCarouselEditWatch')).toHaveTextContent(
      'Showing the videos of Christmas films from Watch'
    )
    expect(screen.getByTestId('CampaignCarouselEditWatch')).toHaveTextContent(
      '8 videos'
    )

    fireEvent.click(screen.getByRole('button', { name: 'Use my own videos' }))

    await waitFor(() => expect(clearWatchMock.result).toHaveBeenCalled())
  })
})
