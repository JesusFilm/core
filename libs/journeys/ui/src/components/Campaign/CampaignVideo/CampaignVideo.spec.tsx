import { ThemeProvider } from '@mui/material/styles'
import { render, screen, within } from '@testing-library/react'

import {
  CampaignPageKind,
  VideoBlockSource
} from '../../../../__generated__/globalTypes'
import { Video } from '../../Video'
import type { VideoProps } from '../../Video'
import { CampaignProvider } from '../CampaignProvider'
import { createCampaignTheme } from '../libs/createCampaignTheme'
import { cssRulesFor } from '../libs/cssRulesFor'
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

// The real player, recorded: the specs read both what it renders and the props it got.
vi.mock('../../Video', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../Video')>()
  return { ...actual, Video: vi.fn(actual.Video) }
})

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
  languageId = '529',
  eager = false
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
        <CampaignVideo block={block} eager={eager} />
      </CampaignProvider>
    </ThemeProvider>
  )
}

/** The player loads on the client after the first render, so its source is awaited. */
async function playerSource(
  blockId: string
): Promise<HTMLSourceElement | null> {
  const player = await screen.findByTestId(`JourneysVideo-${blockId}`)
  return player.querySelector('.vjs-tech source')
}

function lastPlayerProps(): VideoProps {
  const props = vi.mocked(Video).mock.lastCall?.[0]
  if (props == null) throw new Error('the player never rendered')
  return props
}

const subtitledVideoBlock = (() => {
  const mediaVideo = heroVideoBlock.mediaVideo
  if (mediaVideo?.__typename !== 'Video' || mediaVideo.variant == null)
    throw new Error('fixture')
  return videoTree(heroVideoBlock, {
    mediaVideo: {
      ...mediaVideo,
      variant: {
        ...mediaVideo.variant,
        subtitle: [
          {
            __typename: 'VideoSubtitle',
            id: 'subtitleFrId',
            vttSrc: 'https://example.com/fr.vtt',
            language: {
              __typename: 'Language',
              id: '496',
              bcp47: 'fr',
              name: [{ __typename: 'LanguageName', value: 'Français' }]
            }
          },
          {
            __typename: 'VideoSubtitle',
            id: 'subtitleNoFileId',
            vttSrc: null,
            language: {
              __typename: 'Language',
              id: '21028',
              bcp47: 'es',
              name: []
            }
          }
        ]
      }
    }
  })
})()

describe('CampaignVideo', () => {
  it('plays a Watch video with no children inline in the journeys Video player', async () => {
    renderVideo(videoTree(heroVideoBlock))
    expect(await playerSource('heroVideoId')).toHaveAttribute(
      'src',
      'https://arc.gt/hls/storyVideoId/529'
    )
    expect(screen.getByTestId('CampaignVideoTitle')).toHaveTextContent(
      'The Story'
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
      'The Story'
    )
  })

  it('reads a Watch video description in the Page Language, falling back to the primary', () => {
    const { unmount } = renderVideo(videoTree(heroVideoBlock), '496')
    expect(screen.getByTestId('CampaignVideoDescription')).toHaveTextContent(
      'L histoire du premier Campagne.'
    )
    unmount()
    renderVideo(videoTree(heroVideoBlock), '21028')
    expect(screen.getByTestId('CampaignVideoDescription')).toHaveTextContent(
      'The story of the first Outreach.'
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

  it('aligns the poster card text to the reading side', () => {
    renderVideo(videoTree(watchParentVideoBlock), '496')
    expect(
      cssRulesFor(screen.getByRole('link', { name: /La Nativité/ }))
    ).toContain('text-align:start')
  })

  it('plays a YouTube video inline with the fields captured at pick', async () => {
    renderVideo(videoTree(youTubeVideoBlock))
    // video.js swaps the YouTube source for its own iframe tech as it mounts, so the player's props are read instead.
    await screen.findByTestId('JourneysVideo-youTubeVideoId')
    expect(lastPlayerProps()).toMatchObject({
      source: VideoBlockSource.youTube,
      videoId: 'jQaeIJOA6J0',
      mediaVideo: { __typename: 'YouTube', id: 'jQaeIJOA6J0' }
    })
    expect(screen.getByTestId('CampaignVideoTitle')).toHaveTextContent(
      'Outreach around the world'
    )
    expect(screen.getByTestId('CampaignVideoDescription')).toHaveTextContent(
      'How the story is told in twelve countries.'
    )
  })

  it('plays a Mux upload inline with its stored title and poster', async () => {
    renderVideo(videoTree(muxVideoBlock))
    expect((await playerSource('muxVideoId'))?.getAttribute('src')).toMatch(
      /^https:\/\/stream\.mux\.com\/muxPlaybackId\.m3u8/
    )
    expect(screen.getByTestId('CampaignVideoTitle')).toHaveTextContent(
      'Our Outreach outreach'
    )
    expect(
      screen.queryByTestId('CampaignVideoDescription')
    ).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'video image' })).toBeInTheDocument()
  })

  it('renders no caption when a video has no text', async () => {
    const mediaVideo = heroVideoBlock.mediaVideo
    if (mediaVideo?.__typename !== 'Video') throw new Error('fixture')
    renderVideo(
      videoTree(heroVideoBlock, {
        mediaVideo: { ...mediaVideo, title: [], description: [] }
      })
    )
    expect(
      await screen.findByTestId('JourneysVideo-heroVideoId')
    ).toBeInTheDocument()
    expect(screen.queryByTestId('CampaignVideoTitle')).not.toBeInTheDocument()
  })

  it('passes the variant’s subtitle files and the server-source fix to the player', async () => {
    renderVideo(subtitledVideoBlock)
    await screen.findByTestId('JourneysVideo-heroVideoId')
    expect(lastPlayerProps()).toMatchObject({
      id: 'heroVideoId',
      subtitleTracks: [
        {
          id: 'subtitleFrId',
          src: 'https://example.com/fr.vtt',
          language: 'fr',
          label: 'Français'
        }
      ],
      reapplyServerSource: true
    })
  })

  it('passes no subtitle files for YouTube or Mux', async () => {
    const { unmount } = renderVideo(videoTree(youTubeVideoBlock))
    await screen.findByTestId('JourneysVideo-youTubeVideoId')
    expect(lastPlayerProps()).toMatchObject({
      id: 'youTubeVideoId',
      subtitleTracks: [],
      reapplyServerSource: true
    })
    unmount()
    renderVideo(videoTree(muxVideoBlock))
    await screen.findByTestId('JourneysVideo-muxVideoId')
    expect(lastPlayerProps()).toMatchObject({
      id: 'muxVideoId',
      subtitleTracks: [],
      reapplyServerSource: true
    })
  })

  it('loads the poster eagerly with high priority as the Hero’s media', () => {
    renderVideo(videoTree(heroVideoBlock), '529', true)
    const poster = screen.getByTestId('CampaignImage')
    expect(poster).toHaveAttribute('loading', 'eager')
    expect(poster).toHaveAttribute('fetchpriority', 'high')
  })
})
