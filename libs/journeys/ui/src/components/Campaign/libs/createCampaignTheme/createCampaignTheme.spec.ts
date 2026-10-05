import {
  CampaignThemeInput,
  PILL_RADIUS_PX,
  createCampaignTheme
} from './createCampaignTheme'

const light: CampaignThemeInput = {
  themeMode: 'light',
  headerFont: null,
  bodyFont: null,
  labelFont: null,
  primaryColor: '#C52D3A',
  accentColor: '#F2B544',
  backgroundColor: '#FBF7F1',
  surfaceColor: '#FFFFFF',
  textColor: '#26262E',
  mutedColor: '#6D6F81',
  contrastBackgroundColor: '#26262E',
  contrastTextColor: '#FFFFFF',
  radius: 'rounded',
  buttonRadius: 'pill'
}

function rootButtonRadius(
  theme: ReturnType<typeof createCampaignTheme>
): unknown {
  const root = theme.components?.MuiButton?.styleOverrides?.root
  return (root as { borderRadius: number }).borderRadius
}

describe('createCampaignTheme', () => {
  it('maps themeMode to the palette mode and the base colours to the palette', () => {
    const theme = createCampaignTheme(light, false)
    expect(theme.palette.mode).toBe('light')
    expect(theme.palette.primary.main).toBe('#C52D3A')
    expect(theme.palette.secondary.main).toBe('#F2B544')
    expect(theme.palette.background.default).toBe('#FBF7F1')
    expect(theme.palette.background.paper).toBe('#FFFFFF')
    expect(theme.palette.text.primary).toBe('#26262E')
    expect(theme.palette.text.secondary).toBe('#6D6F81')

    expect(
      createCampaignTheme({ ...light, themeMode: 'dark' }, false).palette.mode
    ).toBe('dark')
  })

  it('computes the on-primary and on-accent text by luminance', () => {
    const theme = createCampaignTheme(light, false)
    expect(theme.palette.primary.contrastText).toBe('#fff')
    expect(theme.palette.secondary.contrastText).toBe('rgba(0, 0, 0, 0.87)')
  })

  it('maps radius to 0 / 6 / 14 / 24 px', () => {
    expect(
      createCampaignTheme({ ...light, radius: 'square' }, false).shape
        .borderRadius
    ).toBe(0)
    expect(
      createCampaignTheme({ ...light, radius: 'slight' }, false).shape
        .borderRadius
    ).toBe(6)
    expect(
      createCampaignTheme({ ...light, radius: 'rounded' }, false).shape
        .borderRadius
    ).toBe(14)
    expect(
      createCampaignTheme({ ...light, radius: 'veryRounded' }, false).shape
        .borderRadius
    ).toBe(24)
  })

  it('maps buttonRadius to the pill shape or the theme radius', () => {
    expect(rootButtonRadius(createCampaignTheme(light, false))).toBe(
      PILL_RADIUS_PX
    )
    expect(
      rootButtonRadius(
        createCampaignTheme(
          { ...light, buttonRadius: 'rounded', radius: 'slight' },
          false
        )
      )
    ).toBe(6)
  })

  it('uses the base Montserrat / Open Sans pairing when the three fonts are null', () => {
    const theme = createCampaignTheme(light, false)
    expect(theme.typography.h1.fontFamily).toBe(
      'Montserrat,"Open Sans",sans-serif'
    )
    expect(theme.typography.body1.fontFamily).toBe(
      'Montserrat,"Open Sans",sans-serif'
    )
    expect(theme.typography.overline.fontFamily).toBe(
      'Montserrat,"Open Sans",sans-serif'
    )
  })

  it('binds the three theme fonts by role through createCustomTypography', () => {
    const theme = createCampaignTheme(
      {
        ...light,
        headerFont: 'Fraunces',
        bodyFont: 'Lora',
        labelFont: 'Barlow'
      },
      false
    )
    expect(theme.typography.h1.fontFamily).toBe(
      '"Fraunces",Montserrat,"Open Sans",sans-serif'
    )
    expect(theme.typography.subtitle1.fontFamily).toBe(
      '"Fraunces",Montserrat,"Open Sans",sans-serif'
    )
    expect(theme.typography.body1.fontFamily).toBe(
      '"Lora",Montserrat,"Open Sans",sans-serif'
    )
    expect(theme.typography.caption.fontFamily).toBe(
      '"Lora",Montserrat,"Open Sans",sans-serif'
    )
    expect(theme.typography.overline.fontFamily).toBe(
      '"Barlow",Montserrat,"Open Sans",sans-serif'
    )
    expect(theme.typography.button.fontFamily).toBe(
      '"Barlow",Montserrat,"Open Sans",sans-serif'
    )
  })

  it('keeps the base theme weights per variant', () => {
    const theme = createCampaignTheme(light, false)
    expect(theme.typography.h1.fontWeight).toBe(700)
    expect(theme.typography.h2.fontWeight).toBe(800)
    expect(theme.typography.body1.fontWeight).toBe(400)
    expect(theme.typography.overline.fontWeight).toBe(600)
  })

  it('steps the headings down below md with responsiveFontSizes and leaves body text alone', () => {
    const theme = createCampaignTheme(light, false)
    // responsiveFontSizes keys its steps by raw min-width, not theme.breakpoints.up
    const mdUp = '@media (min-width:600px)'
    for (const variant of ['h1', 'h2', 'h3', 'h4', 'h5'] as const) {
      const style = theme.typography[variant] as Record<
        string,
        { fontSize: string }
      >
      expect(style[mdUp]).toBeDefined()
      expect(
        parseFloat(String(theme.typography[variant].fontSize))
      ).toBeLessThan(parseFloat(style[mdUp].fontSize))
    }
    expect(theme.breakpoints.values.md).toBe(600)
    // h6 already sits at the smallest step and stays put
    expect(
      (theme.typography.h6 as Record<string, unknown>)[mdUp]
    ).toBeUndefined()
    expect(
      (theme.typography.body1 as Record<string, unknown>)[mdUp]
    ).toBeUndefined()
  })

  it('sets the direction from rtl', () => {
    expect(createCampaignTheme(light, true).direction).toBe('rtl')
    expect(createCampaignTheme(light, false).direction).toBe('ltr')
  })
})

describe('createCampaignTheme line heights', () => {
  it('turns the base px line heights into unitless ratios so stepped headings keep their proportions', () => {
    const theme = createCampaignTheme(light, false)
    expect(theme.typography.h1.lineHeight).toBe(1.25)
    expect(theme.typography.body1.lineHeight).toBe(1.5)
    expect(theme.typography.caption.lineHeight).toBeCloseTo(1.667, 3)
  })
})
