import { ThemeProvider } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'

import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import { CampaignProvider } from '../CampaignProvider'
import { createCampaignTheme } from '../libs/createCampaignTheme'
import { transformCampaignBlocks } from '../libs/transformer'
import {
  campaignPublic,
  carouselChild,
  expandedCarouselVideo,
  landingBlocks,
  singleCarouselVideo
} from '../testData'
import type { CampaignBlock, CampaignTreeOf } from '../types'

import {
  CampaignVideoCarousel,
  campaignVideoCarouselCards
} from './CampaignVideoCarousel'

vi.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => false
}))

const theme = createCampaignTheme(campaignPublic.theme, false)

const STRINGS = Object.fromEntries(
  campaignPublic.strings.map((string) => [string.key, string.value])
)

function carouselTree(
  overrides: Partial<CampaignTreeOf<'CampaignVideoCarouselBlock'>> = {},
  extraBlocks: typeof landingBlocks = []
): CampaignTreeOf<'CampaignVideoCarouselBlock'> {
  const carousel = landingBlocks.find((block) => block.id === 'carouselId')
  if (carousel == null || carousel.__typename !== 'CampaignVideoCarouselBlock')
    throw new Error('fixture')
  const tree = transformCampaignBlocks([
    { ...carousel, ...overrides },
    ...extraBlocks
  ])[0]
  return tree as CampaignTreeOf<'CampaignVideoCarouselBlock'>
}

function renderCarousel(block: CampaignTreeOf<'CampaignVideoCarouselBlock'>) {
  return render(
    <ThemeProvider theme={theme}>
      <CampaignProvider
        value={{
          campaign: campaignPublic,
          pageKind: CampaignPageKind.landing,
          region: null
        }}
      >
        <CampaignVideoCarousel block={block} />
      </CampaignProvider>
    </ThemeProvider>
  )
}

describe('campaignVideoCarouselCards', () => {
  it('expands a Watch video with children into the first 12 plus a "See all on Watch" card', () => {
    const block = carouselTree({
      video: expandedCarouselVideo,
      videoId: 'expansionVideoId'
    })
    const cards = campaignVideoCarouselCards({
      block,
      languageId: '529',
      strings: STRINGS
    })

    // The first three children, then the see-all card.
    expect(cards[0].title).toBe('The birth')
    expect(cards[0].href).toBe(
      'https://www.jesusfilm.org/watch/the-birth.html/english.html'
    )
    const last = cards[cards.length - 1]
    expect(last.title).toBe('See all on Watch')
    expect(last.href).toBe('https://www.jesusfilm.org/watch/jesus.html')
  })

  it('caps the expansion at 12 children', () => {
    const block = carouselTree({
      video: {
        ...expandedCarouselVideo,
        childrenCount: 61,
        children: Array.from(
          { length: 15 },
          (_, i) =>
            carouselChild(
              `bulkChild${i}Id`,
              `bulk-${i}`,
              `Bulk film ${i}`,
              60 + i
            )
        )
      },
      videoId: 'expansionVideoId'
    })
    const cards = campaignVideoCarouselCards({
      block,
      languageId: '529',
      strings: STRINGS
    })
    // 12 children + the see-all card.
    expect(cards).toHaveLength(13)
    expect(cards[cards.length - 1].title).toBe('See all on Watch')
  })

  it('renders a Watch video with no children as a single card', () => {
    const block = carouselTree({
      video: singleCarouselVideo,
      videoId: 'singleVideoId'
    })
    const cards = campaignVideoCarouselCards({
      block,
      languageId: '529',
      strings: STRINGS
    })
    expect(cards).toHaveLength(1)
    expect(cards[0].href).toBe('https://www.jesusfilm.org/watch/the-nativity.html')
  })
})

describe('CampaignVideoCarousel', () => {
  it('renders the expanded children as cards and the see-all card', () => {
    renderCarousel(
      carouselTree({ video: expandedCarouselVideo, videoId: 'expansionVideoId' })
    )
    const cards = screen.getAllByTestId('CampaignVideoCarouselCard')
    expect(cards).toHaveLength(4)
    expect(cards[0]).toHaveAttribute('href', 'https://www.jesusfilm.org/watch/the-birth.html/english.html')
    expect(cards[cards.length - 1]).toHaveTextContent('See all on Watch')
  })

  it('renders a single card for an expanded video with no children', () => {
    renderCarousel(
      carouselTree({ video: singleCarouselVideo, videoId: 'singleVideoId' })
    )
    const cards = screen.getAllByTestId('CampaignVideoCarouselCard')
    expect(cards).toHaveLength(1)
    expect(cards[0]).toHaveAttribute(
      'href',
      'https://www.jesusfilm.org/watch/the-nativity.html'
    )
  })

  it('renders nothing but the heading when an explicit carousel has no items', () => {
    renderCarousel(carouselTree())
    expect(
      screen.queryByTestId('CampaignVideoCarouselCards')
    ).not.toBeInTheDocument()
  })
})
