import { ThemeProvider } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'

import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import { CampaignProvider } from '../CampaignProvider'
import { createCampaignTheme } from '../libs/createCampaignTheme'
import { transformCampaignBlocks } from '../libs/transformer'
import {
  afrRegion,
  campaignPublic,
  eurRegion,
  regionPageBlocks
} from '../testData'
import type { CampaignRegion, CampaignTreeOf } from '../types'

import { CampaignRegionHeader } from './CampaignRegionHeader'

const theme = createCampaignTheme(campaignPublic.theme, false)

function headerTree(
  overrides: Partial<CampaignTreeOf<'CampaignRegionHeaderBlock'>> = {}
): CampaignTreeOf<'CampaignRegionHeaderBlock'> {
  const header = regionPageBlocks.find((block) => block.id === 'regionHeaderId')
  if (header == null || header.__typename !== 'CampaignRegionHeaderBlock')
    throw new Error('fixture')
  return transformCampaignBlocks([{ ...header, ...overrides }])[0]
}

function renderHeader(
  block: CampaignTreeOf<'CampaignRegionHeaderBlock'>,
  region: CampaignRegion | null = eurRegion
) {
  return render(
    <ThemeProvider theme={theme}>
      <CampaignProvider
        value={{
          campaign: campaignPublic,
          pageKind: CampaignPageKind.regionTemplate,
          region
        }}
      >
        <CampaignRegionHeader block={block} />
      </CampaignProvider>
    </ThemeProvider>
  )
}

describe('CampaignRegionHeader', () => {
  it("renders the region's name, its lines and the intro, with no back chip", () => {
    renderHeader(headerTree())

    expect(
      screen.getByRole('heading', { level: 1, name: 'Europe' })
    ).toBeInTheDocument()
    expect(screen.getByTestId('CampaignTypography')).toHaveTextContent('EUR')
    expect(screen.getByTestId('CampaignRegionIntro')).toHaveTextContent(
      'A Christmas journey chosen and contextualised by your regional team.'
    )
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.queryByText('All regions')).not.toBeInTheDocument()
  })

  it('reads the region being rendered, so another region shows its own name', () => {
    renderHeader(headerTree(), afrRegion)

    expect(
      screen.getByRole('heading', { level: 1, name: 'Africa' })
    ).toBeInTheDocument()
    expect(screen.queryByTestId('CampaignTypography')).not.toBeInTheDocument()
  })

  it('renders no intro when it is empty', () => {
    renderHeader(headerTree({ intro: '  ' }))

    expect(screen.queryByTestId('CampaignRegionIntro')).not.toBeInTheDocument()
  })

  it('renders nothing without a region', () => {
    renderHeader(headerTree(), null)

    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })
})
