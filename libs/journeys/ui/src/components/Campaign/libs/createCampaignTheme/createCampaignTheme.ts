import {
  Theme,
  ThemeOptions,
  createTheme,
  responsiveFontSizes
} from '@mui/material/styles'
import { deepmerge } from '@mui/utils'

import { baseBreakpoints } from '@core/shared/ui/themes/base/tokens/breakpoints'
import { baseSpacing } from '@core/shared/ui/themes/base/tokens/spacing'
import {
  baseTypography,
  createCustomTypography
} from '@core/shared/ui/themes/base/tokens/typography'

import { contrastText } from '../resolveBand'

export type CampaignThemeMode = 'light' | 'dark'
export type CampaignThemeRadius = 'square' | 'slight' | 'rounded' | 'veryRounded'
export type CampaignThemeButtonRadius = 'rounded' | 'pill'

/** The `CampaignTheme` columns the MUI theme is built from. */
export interface CampaignThemeInput {
  themeMode: CampaignThemeMode
  headerFont: string | null
  bodyFont: string | null
  labelFont: string | null
  primaryColor: string
  accentColor: string
  backgroundColor: string
  surfaceColor: string
  textColor: string
  mutedColor: string
  contrastBackgroundColor: string
  contrastTextColor: string
  radius: CampaignThemeRadius
  buttonRadius: CampaignThemeButtonRadius
}

/** `CampaignRadius` → px (PRD §4). */
export const CAMPAIGN_RADIUS_PX: Record<CampaignThemeRadius, number> = {
  square: 0,
  slight: 6,
  rounded: 14,
  veryRounded: 24
}

/** The pill shape: a radius larger than any button is tall. */
export const PILL_RADIUS_PX = 9999

export function campaignButtonRadiusPx(theme: CampaignThemeInput): number {
  return theme.buttonRadius === 'pill'
    ? PILL_RADIUS_PX
    : CAMPAIGN_RADIUS_PX[theme.radius]
}

const HEADING_VARIANTS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const

const TEXT_VARIANTS = [
  ...HEADING_VARIANTS,
  'subtitle1',
  'subtitle2',
  'body1',
  'body2',
  'caption',
  'overline'
] as const

/**
 * The base theme fixes every line height in px against a px font size. Turn
 * each into the equivalent unitless ratio so a heading stepped down below
 * `md` keeps its proportions and `responsiveFontSizes` can align to the grid.
 */
function withUnitlessLineHeights(
  typography: Pick<ThemeOptions, 'typography'>
): Pick<ThemeOptions, 'typography'> {
  const options = typography.typography
  if (options == null || typeof options === 'function') return typography
  const next: Record<string, unknown> = { ...options }
  for (const variant of TEXT_VARIANTS) {
    const style = options[variant]
    if (style == null) continue
    const { fontSize, lineHeight } = style
    if (
      typeof fontSize !== 'number' ||
      typeof lineHeight !== 'string' ||
      !lineHeight.endsWith('px')
    )
      continue
    next[variant] = {
      ...style,
      lineHeight: Math.round((parseFloat(lineHeight) / fontSize) * 1000) / 1000
    }
  }
  return { typography: next as ThemeOptions['typography'] }
}

/**
 * The MUI theme a published campaign renders with: `themeMode` is the palette
 * mode, the six base colours fill the palette, `radius` and `buttonRadius`
 * become the shape, the three fonts go through the shared
 * `createCustomTypography` (null = the base Montserrat / Open Sans pairing),
 * and `responsiveFontSizes` steps the headings down below `md`.
 */
export function createCampaignTheme(
  theme: CampaignThemeInput,
  rtl: boolean
): Theme {
  const fontFamilies = {
    headerFont: theme.headerFont ?? '',
    bodyFont: theme.bodyFont ?? '',
    labelFont: theme.labelFont ?? ''
  }
  const buttonRadius = campaignButtonRadiusPx(theme)

  const muiTheme = createTheme(
    deepmerge(
      {
        ...baseSpacing,
        ...baseBreakpoints,
        ...withUnitlessLineHeights(
          createCustomTypography(baseTypography, fontFamilies)
        ),
        direction: rtl ? 'rtl' : 'ltr'
      },
      {
        palette: {
          mode: theme.themeMode,
          primary: {
            main: theme.primaryColor,
            contrastText: contrastText(theme.primaryColor)
          },
          secondary: {
            main: theme.accentColor,
            contrastText: contrastText(theme.accentColor)
          },
          background: {
            default: theme.backgroundColor,
            paper: theme.surfaceColor
          },
          text: {
            primary: theme.textColor,
            secondary: theme.mutedColor
          }
        },
        shape: { borderRadius: CAMPAIGN_RADIUS_PX[theme.radius] },
        components: {
          MuiButton: {
            styleOverrides: {
              root: { borderRadius: buttonRadius, textTransform: 'none' }
            }
          },
          MuiPaper: {
            styleOverrides: {
              root: { borderRadius: CAMPAIGN_RADIUS_PX[theme.radius] }
            }
          }
        }
      }
    )
  )

  return responsiveFontSizes(muiTheme, {
    breakpoints: ['md'],
    variants: [...HEADING_VARIANTS],
    factor: 2
  })
}
