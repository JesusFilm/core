import { MockedProvider } from '@apollo/client/testing/react'
import { ThemeProvider } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'

import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import { CampaignProvider } from '../CampaignProvider'
import { createCampaignTheme } from '../libs/createCampaignTheme'
import { transformCampaignBlocks } from '../libs/transformer'
import {
  campaignPublic,
  eurRegion,
  landingBlocks,
  regionPageBlocks
} from '../testData'
import type { CampaignTree } from '../types'

import { CampaignRenderer } from './CampaignRenderer'

const theme = createCampaignTheme(campaignPublic.theme, false)

function renderBlock(
  block: CampaignTree,
  pageKind = CampaignPageKind.landing
): ReturnType<typeof render> {
  return render(
    <MockedProvider>
      <ThemeProvider theme={theme}>
        <CampaignProvider
          value={{
            campaign: campaignPublic,
            pageKind,
            region:
              pageKind === CampaignPageKind.regionTemplate ? eurRegion : null
          }}
        >
          <CampaignRenderer block={block} />
        </CampaignProvider>
      </ThemeProvider>
    </MockedProvider>
  )
}

function treeOf(blocks: typeof landingBlocks, id: string): CampaignTree {
  const node = transformCampaignBlocks(blocks).find((block) => block.id === id)
  if (node == null) throw new Error(`no block ${id}`)
  return node
}

describe('CampaignRenderer', () => {
  it('renders CampaignHeroBlock through CampaignHero', () => {
    renderBlock(treeOf(landingBlocks, 'heroId'))
    expect(screen.getByTestId('CampaignSectionBand-heroId')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Share the story of Christmas'
      })
    ).toBeInTheDocument()
  })

  it('renders CampaignRegionSwitcherBlock through CampaignRegionSwitcher', () => {
    renderBlock(treeOf(landingBlocks, 'landingSwitcherId'))
    expect(screen.getByTestId('CampaignRegionSwitcherGrid')).toBeInTheDocument()
    expect(
      screen.getByTestId('CampaignRegionCard-eurRegionId')
    ).toHaveTextContent('Europe')
  })

  it('renders CampaignVideoCarouselBlock through CampaignVideoCarousel', () => {
    renderBlock(treeOf(landingBlocks, 'carouselId'))
    expect(
      screen.getByTestId('CampaignSectionBand-carouselId')
    ).toHaveTextContent('Films for the season')
  })

  it('renders CampaignJourneyListBlock through CampaignJourneyList', () => {
    renderBlock(treeOf(landingBlocks, 'landingJourneyListId'))
    expect(
      screen.getByTestId('CampaignSectionBand-landingJourneyListId')
    ).toHaveTextContent('Ready-made journeys')
  })

  it('renders CampaignAnalyticsBlock through CampaignAnalytics', () => {
    renderBlock(treeOf(landingBlocks, 'landingAnalyticsId'))
    expect(screen.getByTestId('CampaignAnalyticsSkeleton')).toBeInTheDocument()
  })

  it('renders CampaignRegionHeaderBlock through CampaignRegionHeader', () => {
    renderBlock(
      treeOf(regionPageBlocks, 'regionHeaderId'),
      CampaignPageKind.regionTemplate
    )
    expect(screen.getByTestId('CampaignRegionName')).toHaveTextContent('Europe')
  })

  it('renders CampaignRegionShareBlock through CampaignRegionShare', () => {
    renderBlock(
      treeOf(regionPageBlocks, 'regionShareId'),
      CampaignPageKind.regionTemplate
    )
    expect(screen.getByTestId('CampaignRegionShareIntro')).toBeInTheDocument()
  })

  it('renders CampaignTypographyBlock through CampaignTypography', () => {
    const [note] = treeOf(landingBlocks, 'landingJourneyListId').children
    renderBlock(note)
    expect(screen.getByTestId('CampaignTypography')).toHaveTextContent(
      'New this season'
    )
  })

  it('renders CampaignButtonBlock through CampaignButton', () => {
    const [heroButton] = treeOf(landingBlocks, 'heroId').children
    renderBlock(heroButton)
    expect(screen.getByTestId('CampaignButton')).toHaveTextContent(
      'Choose your region'
    )
  })

  it('renders nothing for an unknown typename', () => {
    const unknown = {
      ...treeOf(landingBlocks, 'heroId'),
      __typename: 'CampaignMysteryBlock'
    } as unknown as CampaignTree
    const { container } = renderBlock(unknown)
    expect(container).toBeEmptyDOMElement()
  })
})
