import { fireEvent, render, screen } from '@testing-library/react'

import { transformCampaignBlocks } from '@core/journeys/ui/Campaign'
import { youTubeVideoBlock } from '@core/journeys/ui/Campaign/testData'

import {
  GetCampaign_campaign as Campaign,
  GetCampaign_campaign_blocks_CampaignVideoCarouselBlock_video as CarouselVideo
} from '../../../../../__generated__/GetCampaign'
import {
  CampaignStringKey,
  VideoLabel
} from '../../../../../__generated__/globalTypes'
import { campaign, withEmptyTranslations } from '../../data'
import { StaticEditor } from '../../testing'
import type { CanvasBlock } from '../canvasBlock'

import { CanvasCarousel } from './CanvasCarousel'

const items = Array.from({ length: 8 }, (_, index) => ({
  ...withEmptyTranslations(youTubeVideoBlock),
  id: `cardId${index}`,
  parentBlockId: 'carouselId',
  parentOrder: index
}))

const withCards: Campaign = {
  ...campaign,
  blocks: [...campaign.blocks, ...(items as never[])]
}

function renderCarousel(source: Campaign = withCards) {
  const block = transformCampaignBlocks(source.blocks).find(
    (candidate) => candidate.id === 'carouselId'
  ) as Extract<CanvasBlock, { __typename: 'CampaignVideoCarouselBlock' }>
  return render(
    <StaticEditor campaignProp={source}>
      <CanvasCarousel block={block} />
    </StaticEditor>
  )
}

describe('CanvasCarousel', () => {
  const scrollBy = vi.fn()
  const geometry = { scrollLeft: 0, clientWidth: 600, scrollWidth: 2000 }

  beforeEach(() => {
    scrollBy.mockReset()
    geometry.scrollLeft = 0
    Element.prototype.scrollBy = scrollBy
    for (const property of Object.keys(geometry))
      Object.defineProperty(HTMLElement.prototype, property, {
        configurable: true,
        get: () => geometry[property as keyof typeof geometry],
        set: (value: number) => {
          geometry[property as keyof typeof geometry] = value
        }
      })
  })

  afterEach(() => {
    for (const property of Object.keys(geometry))
      delete (HTMLElement.prototype as unknown as Record<string, unknown>)[
        property
      ]
  })

  it('shows the previous and next arrows, previous disabled at the start', () => {
    renderCarousel()

    expect(
      screen.getByRole('button', { name: 'Previous videos' })
    ).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByRole('button', { name: 'Next videos' })).toHaveAttribute(
      'aria-disabled',
      'false'
    )
  })

  it('scrolls the row by its width on next without selecting the block', () => {
    renderCarousel()

    fireEvent.click(screen.getByRole('button', { name: 'Next videos' }))

    expect(scrollBy).toHaveBeenCalledWith({ left: 600, behavior: 'smooth' })
  })

  it('shows no arrows on the placeholder, which points at Settings, while there is nothing to show', () => {
    renderCarousel(campaign)

    expect(screen.getByTestId('CanvasCarouselPlaceholder')).toHaveTextContent(
      'Add videos in Settings'
    )
    expect(
      screen.queryByRole('button', { name: 'Next videos' })
    ).not.toBeInTheDocument()
  })
})

describe('CanvasCarousel Campaign Strings', () => {
  const series: CarouselVideo['children'][number] = {
    __typename: 'Video',
    id: 'seriesId',
    label: VideoLabel.series,
    slug: 'the-series',
    childrenCount: 3,
    title: [
      {
        __typename: 'VideoTitle',
        value: 'The series',
        primary: true,
        language: { __typename: 'Language', id: '529' }
      }
    ],
    images: [],
    variant: null
  }
  const collection: CarouselVideo = {
    ...series,
    id: 'collectionId',
    label: VideoLabel.collection,
    slug: 'outreach-collection',
    childrenCount: 1,
    children: [series]
  }

  /** The fixture campaign with its carousel expanding a Watch collection, and its strings edited. */
  function watchCampaign(strings: Record<string, string>): Campaign {
    return {
      ...campaign,
      blocks: campaign.blocks.map((block) =>
        block.id === 'carouselId'
          ? ({
              ...block,
              videoId: 'collectionId',
              videoVariantLanguageId: '529',
              video: collection
            } as never)
          : block
      ),
      strings: campaign.strings.map((string) =>
        string.key in strings
          ? { ...string, value: strings[string.key] }
          : string
      )
    }
  }

  it('shows the edited seeAllOnWatch and videos strings', () => {
    renderCarousel(
      watchCampaign({
        [CampaignStringKey.seeAllOnWatch]: 'Plus sur Watch',
        [CampaignStringKey.videos]: 'vidéos'
      })
    )

    expect(screen.getByTestId('CanvasCarouselCard-seriesId')).toHaveTextContent(
      '3 vidéos'
    )
    expect(
      screen.getByTestId('CanvasCarouselCard-collectionId-seeAll')
    ).toHaveTextContent('Plus sur Watch')
  })

  it('places the count where a videos string with a {{count}} slot puts it', () => {
    renderCarousel(
      watchCampaign({ [CampaignStringKey.videos]: 'Vidéos : {{count}}' })
    )

    expect(screen.getByTestId('CanvasCarouselCard-seriesId')).toHaveTextContent(
      'Vidéos : 3'
    )
  })

  it('leaves a blank seeAllOnWatch blank, as the public page does', () => {
    renderCarousel(watchCampaign({ [CampaignStringKey.seeAllOnWatch]: ' ' }))

    expect(
      screen.getByTestId('CanvasCarouselCard-collectionId-seeAll')
    ).not.toHaveTextContent('See all on Watch')
  })
})
