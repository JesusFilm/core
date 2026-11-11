import { ThemeProvider } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'

import {
  CampaignBackgroundKind,
  CampaignBackgroundOverlay,
  CampaignChildPlacement,
  CampaignPageKind,
  TypographyAlign
} from '../../../../__generated__/globalTypes'
import { CampaignProvider } from '../CampaignProvider'
import { createCampaignTheme } from '../libs/createCampaignTheme'
import {
  bandCssVariables,
  contrastText,
  resolveBand
} from '../libs/resolveBand'
import { transformCampaignBlocks } from '../libs/transformer'
import { campaignPublic, heroCoverBlock, landingBlocks } from '../testData'
import type { CampaignSectionTree } from '../types'

import { CAMPAIGN_HEADER_HEIGHT } from './campaignHeaderHeight'
import { CampaignSectionBand } from './CampaignSectionBand'

const theme = createCampaignTheme(campaignPublic.theme, false)

function sectionWithExtras(): CampaignSectionTree {
  const hero = landingBlocks.find((block) => block.id === 'heroId')
  if (hero == null) throw new Error('fixture')
  const blocks = [
    { ...hero, backgroundKind: CampaignBackgroundKind.contrast },
    {
      ...landingBlocks.find((block) => block.id === 'journeyListNoteId'),
      id: 'aboveSecond',
      parentBlockId: 'heroId',
      parentOrder: 2,
      content: 'Above second',
      placement: CampaignChildPlacement.above
    },
    {
      ...landingBlocks.find((block) => block.id === 'heroButtonId'),
      id: 'belowButton',
      parentOrder: 1,
      label: 'Below button'
    },
    {
      ...landingBlocks.find((block) => block.id === 'journeyListNoteId'),
      id: 'aboveFirst',
      parentBlockId: 'heroId',
      parentOrder: 0,
      content: 'Above first',
      placement: CampaignChildPlacement.above
    },
    {
      ...landingBlocks.find((block) => block.id === 'journeyListNoteId'),
      id: 'belowText',
      parentBlockId: 'heroId',
      parentOrder: 3,
      content: 'Below text',
      placement: CampaignChildPlacement.below
    }
  ] as typeof landingBlocks
  return transformCampaignBlocks(blocks)[0] as CampaignSectionTree
}

function renderBand(
  section: CampaignSectionTree,
  align: TypographyAlign | null = null
) {
  return render(
    <ThemeProvider theme={theme}>
      <CampaignProvider
        value={{
          campaign: campaignPublic,
          pageKind: CampaignPageKind.landing,
          region: null
        }}
      >
        <CampaignSectionBand block={section} align={align}>
          <p data-testid="Body">The body</p>
        </CampaignSectionBand>
      </CampaignProvider>
    </ThemeProvider>
  )
}

describe('CampaignSectionBand', () => {
  it('renders id={block.id} on the band', () => {
    renderBand(sectionWithExtras())
    const band = screen.getByTestId('CampaignSectionBand-heroId')
    expect(band.id).toBe('heroId')
    expect(band.tagName).toBe('SECTION')
  })

  it('exposes the resolved colours as CSS variables', () => {
    const section = sectionWithExtras()
    renderBand(section)
    const band = screen.getByTestId('CampaignSectionBand-heroId')
    const expected = bandCssVariables(
      resolveBand(section, campaignPublic.theme)
    )
    for (const [name, value] of Object.entries(expected)) {
      expect(band.style.getPropertyValue(name)).toBe(value)
    }
    expect(band.style.getPropertyValue('--campaign-band-background')).toBe(
      '#26262E'
    )
  })

  it('layers the five overrides over the kind’s defaults in the CSS variables', () => {
    const section = {
      ...sectionWithExtras(),
      backgroundKind: CampaignBackgroundKind.contrast,
      headingColor: '#112233',
      textColor: '#445566',
      buttonColor: '#778899',
      buttonTextColor: '#AABBCC',
      accentColor: '#DDEEFF'
    }
    renderBand(section)
    const band = screen.getByTestId('CampaignSectionBand-heroId')
    const read = (name: string): string => band.style.getPropertyValue(name)

    // The contrast row's own values would be the theme's contrast text and accent.
    expect(read('--campaign-band-background')).toBe('#26262E')
    expect(read('--campaign-band-heading')).toBe('#112233')
    expect(read('--campaign-band-text')).toBe('#445566')
    expect(read('--campaign-band-button')).toBe('#778899')
    expect(read('--campaign-band-button-label')).toBe('#AABBCC')
    expect(read('--campaign-band-accent')).toBe('#DDEEFF')
    expect(read('--campaign-band-eyebrow')).toBe('#DDEEFF')
  })

  it('paints a custom background from the section’s own colour with computed contrast text', () => {
    const section = {
      ...sectionWithExtras(),
      backgroundKind: CampaignBackgroundKind.custom,
      backgroundColor: '#123456'
    }
    renderBand(section)
    const band = screen.getByTestId('CampaignSectionBand-heroId')

    expect(band.style.getPropertyValue('--campaign-band-background')).toBe(
      '#123456'
    )
    expect(band.style.getPropertyValue('--campaign-band-text')).toBe(
      contrastText('#123456')
    )
  })

  it('lets a heading override beat the custom band’s computed text', () => {
    const section = {
      ...sectionWithExtras(),
      backgroundKind: CampaignBackgroundKind.custom,
      backgroundColor: '#123456',
      headingColor: '#FFEEDD'
    }
    renderBand(section)
    const band = screen.getByTestId('CampaignSectionBand-heroId')

    expect(band.style.getPropertyValue('--campaign-band-heading')).toBe(
      '#FFEEDD'
    )
    expect(band.style.getPropertyValue('--campaign-band-text')).toBe(
      contrastText('#123456')
    )
  })

  it('orders above children by parentOrder, then the body, then below children by parentOrder', () => {
    renderBand(sectionWithExtras())
    const band = screen.getByTestId('CampaignSectionBand-heroId')
    const texts = Array.from(
      band.querySelectorAll(
        '[data-testid="CampaignTypography"], [data-testid="Body"], [data-testid="CampaignButton"]'
      )
    ).map((node) => node.textContent)
    expect(texts).toEqual([
      'Above first',
      'Above second',
      'The body',
      'Below button',
      'Below text'
    ])
  })

  it('offsets every band by the sticky header height so a ScrollToBlockAction target is not covered', () => {
    renderBand(sectionWithExtras())
    expect(CAMPAIGN_HEADER_HEIGHT).toBe(64)
    expect(screen.getByTestId('CampaignSectionBand-heroId')).toHaveStyle({
      scrollMarginTop: `${CAMPAIGN_HEADER_HEIGHT}px`
    })
  })

  it('renders the image kind cover and overlay behind the content', () => {
    const section = sectionWithExtras()
    const cover = {
      __typename: 'CampaignImageBlock',
      id: 'coverId',
      campaignId: 'campaignId',
      pageId: null,
      regionId: null,
      parentBlockId: 'heroId',
      parentOrder: null,
      src: 'https://images.example.org/cover.jpg',
      alt: null,
      width: 1600,
      height: 900,
      children: [],
      cover: null,
      media: null,
      logo: null
    } as unknown as CampaignSectionTree['cover']
    renderBand({
      ...section,
      backgroundKind: CampaignBackgroundKind.image,
      coverBlockId: 'coverId',
      backgroundOverlay: null,
      cover
    })
    expect(screen.getByTestId('CampaignBandCover')).toHaveAttribute(
      'src',
      'https://images.example.org/cover.jpg'
    )
    expect(screen.getByTestId('CampaignBandOverlay')).toHaveStyle({
      backgroundColor: 'rgba(0, 0, 0, 0.55)'
    })
    expect(screen.getByTestId('Body')).toBeInTheDocument()
  })

  it.each([
    [CampaignBackgroundOverlay.light, 0.3],
    [CampaignBackgroundOverlay.medium, 0.55],
    [CampaignBackgroundOverlay.heavy, 0.75]
  ])(
    'paints the %s overlay at %d over the cover, with white text and dark translucent cards',
    (overlay, alphaValue) => {
      const section = sectionWithExtras()
      renderBand({
        ...section,
        backgroundKind: CampaignBackgroundKind.image,
        coverBlockId: heroCoverBlock.id,
        backgroundOverlay: overlay,
        cover: {
          ...heroCoverBlock,
          children: [],
          cover: null,
          media: null,
          logo: null
        }
      })
      expect(screen.getByTestId('CampaignBandOverlay')).toHaveStyle({
        backgroundColor: `rgba(0, 0, 0, ${alphaValue})`
      })
      const band = screen.getByTestId('CampaignSectionBand-heroId')
      expect(band.style.getPropertyValue('--campaign-band-text')).toBe(
        '#FFFFFF'
      )
      expect(band.style.getPropertyValue('--campaign-band-card')).toBe(
        'rgba(0, 0, 0, 0.4)'
      )
    }
  )

  it('renders no cover for the image kind when the slot is empty', () => {
    renderBand({
      ...sectionWithExtras(),
      backgroundKind: CampaignBackgroundKind.image,
      coverBlockId: null
    })
    expect(screen.queryByTestId('CampaignBandCover')).not.toBeInTheDocument()
    expect(screen.queryByTestId('CampaignBandOverlay')).not.toBeInTheDocument()
  })

  it('applies the body alignment to the band', () => {
    renderBand(sectionWithExtras(), TypographyAlign.center)
    expect(screen.getByTestId('CampaignSectionBand-heroId')).toHaveStyle({
      textAlign: 'center'
    })
  })
})
