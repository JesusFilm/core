import { ThemeProvider } from '@mui/material/styles'
import { fireEvent, render, screen, within } from '@testing-library/react'

import {
  CampaignPageKind,
  VideoLabel
} from '../../../../__generated__/globalTypes'
import type {
  CampaignPublicBlockFields_CampaignVideoCarouselBlock_video_children as ExpandedChild,
  CampaignPublicBlockFields_CampaignVideoCarouselBlock_video as ExpandedVideo
} from '../__generated__/CampaignPublicBlockFields'
import { shouldRenderSection } from '../CampaignPage/shouldRenderSection'
import { CampaignProvider } from '../CampaignProvider'
import { createCampaignTheme } from '../libs/createCampaignTheme'
import {
  campaignPublic,
  heroVideoBlock,
  landingBlocks,
  muxVideoBlock,
  watchParentVideoBlock,
  youTubeVideoBlock
} from '../testData'
import type { CampaignBlock, CampaignTree, CampaignTreeOf } from '../types'

import { CampaignVideoCarousel } from './CampaignVideoCarousel'

vi.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => false
}))

const theme = createCampaignTheme(campaignPublic.theme, false)

type Carousel = CampaignTreeOf<'CampaignVideoCarouselBlock'>

const carouselRow = landingBlocks.find(
  (block) => block.id === 'carouselId'
) as Extract<CampaignBlock, { __typename: 'CampaignVideoCarouselBlock' }>

function tree(
  block: CampaignBlock,
  children: CampaignTree[] = []
): CampaignTree {
  return { ...block, children, cover: null, media: null, logo: null }
}

function item(
  block: CampaignBlock,
  id: string,
  parentOrder: number
): CampaignTree {
  return tree({ ...block, id, parentBlockId: 'carouselId', parentOrder })
}

function carousel(
  overrides: Partial<Carousel> = {},
  children: CampaignTree[] = []
): Carousel {
  return { ...(tree(carouselRow, children) as Carousel), ...overrides }
}

function watchChild(
  index: number,
  overrides: Partial<ExpandedChild> = {}
): ExpandedChild {
  return {
    __typename: 'Video',
    id: `childId${index}`,
    label: VideoLabel.shortFilm,
    slug: `child-${index}`,
    childrenCount: 0,
    title: [
      {
        __typename: 'VideoTitle',
        value: `Film ${index}`,
        primary: true,
        language: { __typename: 'Language', id: '529' }
      },
      {
        __typename: 'VideoTitle',
        value: `Film ${index} (fr)`,
        primary: false,
        language: { __typename: 'Language', id: '496' }
      }
    ],
    images: [
      {
        __typename: 'CloudflareImage',
        mobileCinematicHigh: `https://imagedelivery.net/hash/child${index}/mobileCinematicHigh`
      }
    ],
    variant: {
      __typename: 'VideoVariant',
      id: `childId${index}-529`,
      duration: 125,
      slug: `child-${index}/english`
    },
    ...overrides
  }
}

function expanded(
  children: ExpandedChild[],
  overrides: Partial<ExpandedVideo> = {}
): Partial<Carousel> {
  return {
    videoId: 'collectionId',
    videoVariantLanguageId: '529',
    video: {
      ...watchChild(0),
      id: 'collectionId',
      label: VideoLabel.collection,
      slug: 'christmas-collection',
      childrenCount: children.length,
      title: [
        {
          __typename: 'VideoTitle',
          value: 'Christmas collection',
          primary: true,
          language: { __typename: 'Language', id: '529' }
        }
      ],
      variant: {
        __typename: 'VideoVariant',
        id: 'collectionId-529',
        duration: 0,
        slug: 'christmas-collection/english'
      },
      children,
      ...overrides
    }
  }
}

function renderCarousel(block: Carousel, languageId = '529') {
  return render(
    <ThemeProvider theme={theme}>
      <CampaignProvider
        value={{
          campaign: { ...campaignPublic, languageId },
          pageKind: CampaignPageKind.landing,
          region: null
        }}
      >
        <CampaignVideoCarousel block={block} />
      </CampaignProvider>
    </ThemeProvider>
  )
}

function cardIds(): string[] {
  return screen
    .getAllByTestId(/^CampaignVideoCarouselCard-|^CampaignVideoCarouselSeeAll$/)
    .map((card) => card.getAttribute('data-testid') ?? '')
}

const context = {
  pageKind: CampaignPageKind.landing,
  region: null,
  regions: []
}

describe('CampaignVideoCarousel', () => {
  describe('Watch expansion', () => {
    it('renders the Video’s children as cards in Watch’s order, then a "See all on Watch" card', () => {
      renderCarousel(
        carousel(expanded([watchChild(2), watchChild(0), watchChild(1)]))
      )

      expect(cardIds()).toEqual([
        'CampaignVideoCarouselCard-childId2',
        'CampaignVideoCarouselCard-childId0',
        'CampaignVideoCarouselCard-childId1',
        'CampaignVideoCarouselSeeAll'
      ])
      const seeAll = screen.getByTestId('CampaignVideoCarouselSeeAll')
      expect(seeAll).toHaveTextContent('See all on Watch')
      expect(seeAll).toHaveAttribute(
        'href',
        'https://www.jesusfilm.org/watch/christmas-collection.html/english.html'
      )
      expect(seeAll).toHaveAttribute('target', '_blank')
    })

    it('renders only the first 12 children before "See all on Watch"', () => {
      renderCarousel(
        carousel(
          expanded(Array.from({ length: 15 }, (_, index) => watchChild(index)))
        )
      )

      const ids = cardIds()
      expect(ids).toHaveLength(13)
      expect(ids[11]).toBe('CampaignVideoCarouselCard-childId11')
      expect(ids[12]).toBe('CampaignVideoCarouselSeeAll')
    })

    it('expands whatever the Video’s label', () => {
      renderCarousel(
        carousel(
          expanded([watchChild(0)], {
            label: VideoLabel.featureFilm
          })
        )
      )

      expect(cardIds()).toEqual([
        'CampaignVideoCarouselCard-childId0',
        'CampaignVideoCarouselSeeAll'
      ])
    })

    it('links each child card to Watch through its variant slug, with the duration badge and its title in the Page Language', () => {
      renderCarousel(carousel(expanded([watchChild(0)])), '496')

      const card = screen.getByTestId('CampaignVideoCarouselCard-childId0')
      expect(card).toHaveAttribute(
        'href',
        'https://www.jesusfilm.org/watch/child-0.html/english.html'
      )
      expect(card).toHaveTextContent('Film 0 (fr)')
      expect(card).toHaveTextContent('Watch')
      expect(
        within(card).getByTestId('CampaignVideoCarouselCardDuration')
      ).toHaveTextContent('2:05')
    })

    it('shows a child that is itself a container as a card linking to it on Watch with "<n> videos", one level only', () => {
      renderCarousel(
        carousel(
          expanded([
            watchChild(0, {
              label: VideoLabel.series,
              childrenCount: 8,
              variant: null
            })
          ])
        )
      )

      const card = screen.getByTestId('CampaignVideoCarouselCard-childId0')
      expect(card).toHaveAttribute(
        'href',
        'https://www.jesusfilm.org/watch/child-0.html'
      )
      expect(card).toHaveTextContent('8 videos')
      expect(
        within(card).queryByTestId('CampaignVideoCarouselCardDuration')
      ).not.toBeInTheDocument()
      expect(cardIds()).toHaveLength(2)
    })

    it('renders a Video with no children as that one card, with no "See all"', () => {
      renderCarousel(
        carousel(
          expanded([], {
            id: 'filmId',
            label: VideoLabel.featureFilm,
            slug: 'jesus',
            variant: {
              __typename: 'VideoVariant',
              id: 'filmId-529',
              duration: 7380,
              slug: 'jesus/english'
            }
          })
        )
      )

      expect(cardIds()).toEqual(['CampaignVideoCarouselCard-filmId'])
      const card = screen.getByTestId('CampaignVideoCarouselCard-filmId')
      expect(card).toHaveAttribute(
        'href',
        'https://www.jesusfilm.org/watch/jesus.html/english.html'
      )
      expect(card).toHaveTextContent('Christmas collection')
      expect(
        within(card).getByTestId('CampaignVideoCarouselCardDuration')
      ).toHaveTextContent('2:03:00')
    })

    it('renders an expanded video with zero published children as one card', () => {
      // childrenCount counts published children; the gateway's children list
      // also drops ones without languages or restricted on this platform.
      renderCarousel(carousel(expanded([], { childrenCount: 4 })))

      expect(cardIds()).toEqual(['CampaignVideoCarouselCard-collectionId'])
      expect(
        shouldRenderSection(
          carousel({ ...expanded([]), eyebrow: '', title: '' }),
          context
        )
      ).toBe(true)
    })

    it('ignores the explicit children while a video is set', () => {
      renderCarousel(
        carousel(expanded([watchChild(0)]), [
          item(youTubeVideoBlock, 'youTubeItemId', 0)
        ])
      )

      expect(
        screen.queryByTestId('CampaignVideoCarouselCard-youTubeItemId')
      ).not.toBeInTheDocument()
    })
  })

  describe('explicit mode', () => {
    it('renders the CampaignVideoBlock children as cards by parentOrder', () => {
      renderCarousel(
        carousel({}, [
          item(youTubeVideoBlock, 'youTubeItemId', 0),
          item(heroVideoBlock, 'watchItemId', 1),
          item(muxVideoBlock, 'muxItemId', 2)
        ])
      )

      expect(cardIds()).toEqual([
        'CampaignVideoCarouselCard-youTubeItemId',
        'CampaignVideoCarouselCard-watchItemId',
        'CampaignVideoCarouselCard-muxItemId'
      ])
    })

    it('links a YouTube card to YouTube with the youtube string and its duration badge', () => {
      renderCarousel(
        carousel({}, [item(youTubeVideoBlock, 'youTubeItemId', 0)])
      )

      const card = screen.getByTestId('CampaignVideoCarouselCard-youTubeItemId')
      expect(card).toHaveAttribute(
        'href',
        'https://www.youtube.com/watch?v=jQaeIJOA6J0'
      )
      expect(card).toHaveTextContent('Christmas around the world')
      expect(card).toHaveTextContent('Watch on YouTube')
      expect(
        within(card).getByTestId('CampaignVideoCarouselCardDuration')
      ).toHaveTextContent('4:05')
    })

    it('links a Watch item to Watch, and a Watch container item shows "<n> videos"', () => {
      renderCarousel(
        carousel({}, [
          item(heroVideoBlock, 'watchItemId', 0),
          item(watchParentVideoBlock, 'parentItemId', 1)
        ])
      )

      expect(
        screen.getByTestId('CampaignVideoCarouselCard-watchItemId')
      ).toHaveAttribute(
        'href',
        'https://www.jesusfilm.org/watch/the-nativity.html/english.html'
      )
      expect(
        screen.getByTestId('CampaignVideoCarouselCard-parentItemId')
      ).toHaveTextContent('61 videos')
    })

    it('plays an uploaded video in a dialog', () => {
      renderCarousel(carousel({}, [item(muxVideoBlock, 'muxItemId', 0)]))

      const card = screen.getByTestId('CampaignVideoCarouselCard-muxItemId')
      expect(card).not.toHaveAttribute('href')
      fireEvent.click(card)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByTestId('CampaignVideo-muxItemId')).toBeInTheDocument()
    })

    it('does not render items as Extras below the body', () => {
      renderCarousel(
        carousel({}, [item(youTubeVideoBlock, 'youTubeItemId', 0)])
      )

      expect(screen.queryByTestId('CampaignVideo-youTubeItemId')).toBeNull()
    })

    it('renders the text alone with nothing to show, and is skipped with no text either', () => {
      renderCarousel(carousel())

      expect(screen.getByText('Films for the season')).toBeInTheDocument()
      expect(
        screen.queryByTestId('CampaignVideoCarouselCards-carouselId')
      ).not.toBeInTheDocument()
      expect(shouldRenderSection(carousel(), context)).toBe(true)
      expect(
        shouldRenderSection(carousel({ eyebrow: '', title: '' }), context)
      ).toBe(false)
      expect(
        shouldRenderSection(
          carousel({ eyebrow: '', title: '' }, [
            item(youTubeVideoBlock, 'youTubeItemId', 0)
          ]),
          context
        )
      ).toBe(true)
    })
  })
})
