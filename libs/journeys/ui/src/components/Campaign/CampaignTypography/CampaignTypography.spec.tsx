import { ThemeProvider } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'
import { ReactNode } from 'react'

import { TypographyAlign, TypographyVariant } from '../../../../__generated__/globalTypes'
import { CampaignSectionContext } from '../CampaignSectionBand'
import { createCampaignTheme } from '../libs/createCampaignTheme'
import { resolveBand } from '../libs/resolveBand'
import { campaignPublic, landingBlocks } from '../testData'
import type { CampaignBlockOf } from '../types'

import { CampaignTypography } from './CampaignTypography'

const theme = createCampaignTheme(campaignPublic.theme, false)
const note = landingBlocks.find(
  (block) => block.id === 'journeyListNoteId'
) as CampaignBlockOf<'CampaignTypographyBlock'>

const contrastBand = resolveBand(
  { backgroundKind: 'contrast', textColor: '#ABCDEF', headingColor: '#123456' },
  campaignPublic.theme
)

function renderIn(ui: ReactNode, align: TypographyAlign | null = null) {
  return render(
    <ThemeProvider theme={theme}>
      <CampaignSectionContext.Provider value={{ band: contrastBand, align }}>
        {ui}
      </CampaignSectionContext.Provider>
    </ThemeProvider>
  )
}

describe('CampaignTypography', () => {
  it('renders body1 when variant is null', () => {
    renderIn(<CampaignTypography block={{ ...note, typographyVariant: null }} />)
    const text = screen.getByTestId('CampaignTypography')
    expect(text).toHaveClass('MuiTypography-body1')
    expect(text.tagName).toBe('P')
  })

  it('lets the variant decide size, weight and font family through the theme', () => {
    renderIn(<CampaignTypography block={{ ...note, typographyVariant: TypographyVariant.h3 }} />)
    const heading = screen.getByRole('heading', { level: 3, name: 'New this season' })
    expect(heading).toHaveClass('MuiTypography-h3')
    expect(theme.typography.h3.fontWeight).toBe(700)
    expect(theme.typography.h3.fontFamily).toContain('Montserrat')
  })

  it('renders overline and caption as paragraphs', () => {
    renderIn(<CampaignTypography block={{ ...note, typographyVariant: TypographyVariant.overline }} />)
    expect(screen.getByTestId('CampaignTypography').tagName).toBe('P')
  })

  it('inherits the section alignment when align is null and sets its own otherwise', () => {
    const { rerender } = renderIn(<CampaignTypography block={{ ...note, align: null }} />)
    const inherited = screen.getByTestId('CampaignTypography')
    expect(inherited.className).not.toMatch(/MuiTypography-align/)

    rerender(
      <ThemeProvider theme={theme}>
        <CampaignSectionContext.Provider value={{ band: contrastBand, align: null }}>
          <CampaignTypography block={{ ...note, align: TypographyAlign.right }} />
        </CampaignSectionContext.Provider>
      </ThemeProvider>
    )
    expect(screen.getByTestId('CampaignTypography')).toHaveClass('MuiTypography-alignRight')
  })

  it('falls to the section text colour when color is null, and the heading colour for headings', () => {
    renderIn(<CampaignTypography block={{ ...note, color: null }} />)
    expect(screen.getByTestId('CampaignTypography')).toHaveStyle({ color: '#ABCDEF' })
  })

  it('uses the section heading colour for heading variants', () => {
    renderIn(
      <CampaignTypography block={{ ...note, color: null, typographyVariant: TypographyVariant.h2 }} />
    )
    expect(screen.getByTestId('CampaignTypography')).toHaveStyle({ color: '#123456' })
  })

  it('uses its own hex colour when set', () => {
    renderIn(<CampaignTypography block={{ ...note, color: '#00FF00' }} />)
    expect(screen.getByTestId('CampaignTypography')).toHaveStyle({ color: '#00FF00' })
  })

  it('falls through to the theme when rendered outside a section', () => {
    render(
      <ThemeProvider theme={theme}>
        <CampaignTypography block={{ ...note, color: null }} />
      </ThemeProvider>
    )
    expect(screen.getByTestId('CampaignTypography')).toBeInTheDocument()
  })

  it('renders nothing for empty content', () => {
    const { container } = renderIn(<CampaignTypography block={{ ...note, content: '  ' }} />)
    expect(container).toBeEmptyDOMElement()
  })
})
