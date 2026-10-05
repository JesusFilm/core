import { ThemeProvider } from '@mui/material/styles'
import { render, screen, within } from '@testing-library/react'

import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import { CampaignProvider } from '../CampaignProvider'
import { createCampaignTheme } from '../libs/createCampaignTheme'
import {
  campaignPublic,
  heroVideoBlock,
  muxVideoBlock,
  watchParentVideoBlock,
  youTubeVideoBlock
} from '../testData'
import type { CampaignBlock, CampaignTreeOf } from '../types'

import { CampaignVideo } from './CampaignVideo'

vi.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => false
}))

const theme = createCampaignTheme(campaignPublic.theme, false)

function videoTree(
  block: CampaignBlock,
  overrides: Partial<CampaignBlock> = {}
): CampaignTreeOf<'CampaignVideoBlock'> {
  return {
    ...block,
    ...overrides,
    children: [],
    cover: null,
    media: null,
    logo: null
  } as CampaignTreeOf<'CampaignVideoBlock'>
}

function renderVideo(
  block: CampaignTreeOf<'CampaignVideoBlock'>,
  languageId = '529'
) {
  return render(
    <ThemeProvider theme={theme}>
      <CampaignProvider
        value={{
          campaign: { ...campaignPublic, languageId },
          pageKind: CampaignPageKind.landing,
          region: null
        }}
      >
        <CampaignVideo block={block} />
      </CampaignProvider>
    </ThemeProvider>
  )
}

function playerSource(blockId: string): HTMLSourceElement | null {
  return screen
    .getByTestId(`JourneysVideo-${blockId}`)
    .querySelector('.vjs-tech source')
}

describe('CampaignVideo', () => {
  it('plays a Watch video with no children inline in the journeys Video player', () => {
    renderVideo(videoTree(heroVideoBlock))
    expect(playerSource('heroVideoId')).toHaveAttribute(
      'src',
      'https://arc.gt/hls/nativityVideoId/529'
    )
    expect(screen.getByTestId('CampaignVideoTitle')).toHaveTextContent(
      'The Nativity'
    )
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('reads a Watch video title in the Page Language, falling back to the primary', () => {
    const { unmount } = renderVideo(videoTree(heroVideoBlock), '496')
    expect(screen.getByTestId('CampaignVideoTitle')).toHaveTextContent(
      'La Nativité'
    )
    unmount()
    renderVideo(videoTree(heroVideoBlock), '21028')
    expect(screen.getByTestId('CampaignVideoTitle')).toHaveTextContent(
      'The Nativity'
    )
  })

  it('lets the row’s overrides win over the Watch text', () => {
    renderVideo(
      videoTree(heroVideoBlock, {
        title: 'Our favourite scene',
        description: 'Watch it with your family.'
      }),
      '496'
    )
    expect(screen.getByTestId('CampaignVideoTitle')).toHaveTextContent(
      'Our favourite scene'
    )
    expect(screen.getByTestId('CampaignVideoDescription')).toHaveTextContent(
      'Watch it with your family.'
    )
  })

  it('shows a Watch video with children as a poster card linking out to Watch', () => {
    renderVideo(videoTree(watchParentVideoBlock), '496')
    const card = screen.getByRole('link', { name: /La Nativité/ })
    expect(card).toHaveAttribute(
      'href',
      'https://www.jesusfilm.org/watch/jesus.html/english.html'
    )
    expect(card).toHaveAttribute('target', '_blank')
    expect(card).toHaveAttribute('rel', 'noopener noreferrer')
    expect(within(card).getByText('61 videos')).toBeInTheDocument()
    expect(card.querySelector('img')).toHaveAttribute(
      'src',
      'https://imagedelivery.net/accountHash/jesusVideoId/mobileCinematicHigh'
    )
    expect(
      screen.queryByTestId('JourneysVideo-watchParentVideoId')
    ).not.toBeInTheDocument()
  })

  it('plays a YouTube video inline with the fields captured at pick', () => {
    renderVideo(videoTree(youTubeVideoBlock))
    expect(playerSource('youTubeVideoId')).toHaveAttribute(
      'src',
      'https://www.youtube.com/embed/jQaeIJOA6J0?start=0&end=10000'
    )
    expect(screen.getByTestId('CampaignVideoTitle')).toHaveTextContent(
      'Christmas around the world'
    )
    expect(screen.getByTestId('CampaignVideoDescription')).toHaveTextContent(
      'How the story is told in twelve countries.'
    )
  })

  it('plays a Mux upload inline with its stored title and poster', () => {
    renderVideo(videoTree(muxVideoBlock))
    expect(playerSource('muxVideoId')?.getAttribute('src')).toMatch(
      /^https:\/\/stream\.mux\.com\/muxPlaybackId\.m3u8/
    )
    expect(screen.getByTestId('CampaignVideoTitle')).toHaveTextContent(
      'Our Christmas outreach'
    )
    expect(
      screen.queryByTestId('CampaignVideoDescription')
    ).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'video image' })).toBeInTheDocument()
  })

  it('renders no caption when a video has no text', () => {
    const mediaVideo = heroVideoBlock.mediaVideo
    if (mediaVideo?.__typename !== 'Video') throw new Error('fixture')
    renderVideo(
      videoTree(heroVideoBlock, {
        mediaVideo: { ...mediaVideo, title: [] }
      })
    )
    expect(screen.getByTestId('JourneysVideo-heroVideoId')).toBeInTheDocument()
    expect(screen.queryByTestId('CampaignVideoTitle')).not.toBeInTheDocument()
  })
})
