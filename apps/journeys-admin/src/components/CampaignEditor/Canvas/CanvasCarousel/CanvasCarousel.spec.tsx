import { fireEvent, render, screen } from '@testing-library/react'

import { transformCampaignBlocks } from '@core/journeys/ui/Campaign'
import { youTubeVideoBlock } from '@core/journeys/ui/Campaign/testData'

import { GetCampaign_campaign as Campaign } from '../../../../../__generated__/GetCampaign'
import { campaign, withEmptyTranslations } from '../../data'
import { StaticEditor } from '../../testing'
import type { CanvasBlock } from '../CanvasSection'

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

  it('shows no arrows on the placeholder while there is nothing to show', () => {
    renderCarousel(campaign)

    expect(screen.getByTestId('CanvasCarouselPlaceholder')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Next videos' })
    ).not.toBeInTheDocument()
  })
})
