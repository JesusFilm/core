import { ThemeProvider } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'

import {
  CampaignPageKind,
  TypographyAlign
} from '../../../../__generated__/globalTypes'
import { CampaignProvider } from '../CampaignProvider'
import { createCampaignTheme } from '../libs/createCampaignTheme'
import { transformCampaignBlocks } from '../libs/transformer'
import { campaignPublic, landingBlocks } from '../testData'
import type { CampaignTreeOf } from '../types'

import { CampaignHero } from './CampaignHero'

const theme = createCampaignTheme(campaignPublic.theme, false)

function heroTree(
  overrides: Partial<CampaignTreeOf<'CampaignHeroBlock'>> = {},
  extraBlocks: typeof landingBlocks = []
): CampaignTreeOf<'CampaignHeroBlock'> {
  const hero = landingBlocks.find((block) => block.id === 'heroId')
  if (hero == null || hero.__typename !== 'CampaignHeroBlock')
    throw new Error('fixture')
  const tree = transformCampaignBlocks([
    { ...hero, ...overrides },
    ...extraBlocks
  ])[0]
  return tree as CampaignTreeOf<'CampaignHeroBlock'>
}

function renderHero(block: CampaignTreeOf<'CampaignHeroBlock'>) {
  return render(
    <ThemeProvider theme={theme}>
      <CampaignProvider
        value={{
          campaign: campaignPublic,
          pageKind: CampaignPageKind.landing,
          region: null
        }}
      >
        <CampaignHero block={block} />
      </CampaignProvider>
    </ThemeProvider>
  )
}

describe('CampaignHero', () => {
  it('renders eyebrow, title and lede', () => {
    renderHero(heroTree())
    expect(screen.getByTestId('CampaignEyebrow')).toHaveTextContent(
      'Christmas 2026'
    )
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Share the story of Christmas'
      })
    ).toBeInTheDocument()
    expect(screen.getByTestId('CampaignLede')).toHaveTextContent(
      'Pick your region to find a journey in your language, ready to share.'
    )
  })

  it('applies align to the band and the heading', () => {
    renderHero(heroTree({ align: TypographyAlign.center }))
    expect(screen.getByTestId('CampaignSectionBand-heroId')).toHaveStyle({
      textAlign: 'center'
    })
    expect(screen.getByTestId('CampaignTitle')).toBeInTheDocument()
  })

  it('renders nothing for an empty text field', () => {
    renderHero(heroTree({ eyebrow: null, lede: '' }))
    expect(screen.queryByTestId('CampaignEyebrow')).not.toBeInTheDocument()
    expect(screen.queryByTestId('CampaignLede')).not.toBeInTheDocument()
    expect(screen.getByTestId('CampaignTitle')).toBeInTheDocument()
  })

  it('leaves room for the media slot only when the hero owns a media block', () => {
    renderHero(heroTree())
    expect(screen.queryByTestId('CampaignHeroMedia')).not.toBeInTheDocument()
  })

  it('renders the media slot when a media block is owned', () => {
    const media = {
      ...landingBlocks.find((block) => block.id === 'journeyListNoteId'),
      id: 'heroMediaId',
      parentBlockId: 'heroId',
      parentOrder: null,
      placement: null
    } as (typeof landingBlocks)[number]
    renderHero(heroTree({ mediaBlockId: 'heroMediaId' }, [media]))
    expect(screen.getByTestId('CampaignHeroMedia')).toBeInTheDocument()
  })
})
