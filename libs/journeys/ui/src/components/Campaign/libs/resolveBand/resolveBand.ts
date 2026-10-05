import { alpha, createTheme } from '@mui/material/styles'

/** The theme columns the band table reads (a subset of `CampaignTheme`). */
export interface CampaignBandTheme {
  primaryColor: string
  accentColor: string
  backgroundColor: string
  surfaceColor: string
  textColor: string
  mutedColor: string
  contrastBackgroundColor: string
  contrastTextColor: string
}

export type CampaignBandKind =
  | 'none'
  | 'surface'
  | 'primary'
  | 'contrast'
  | 'custom'
  | 'image'

/** The section columns the band table reads (a subset of `CampaignSectionBlock`). */
export interface CampaignBandSection {
  backgroundKind: CampaignBandKind
  backgroundColor?: string | null
  headingColor?: string | null
  textColor?: string | null
  buttonColor?: string | null
  buttonTextColor?: string | null
  accentColor?: string | null
}

export interface ResolvedBand {
  /** The band's background colour (behind the cover for `image`). */
  background: string
  /** Body text. */
  text: string
  /** Headings; the text colour unless the section overrides it. */
  heading: string
  /** Muted copy: `mutedColor` on `none` / `surface`, else the text at alpha. */
  muted: string
  /** Card and tile surfaces inside the band. */
  card: string
  /** Borders and dividers: the text at low alpha. */
  border: string
  /** The eyebrow line; `accentColor` on the contrast band. */
  eyebrow: string
  /** The accent for chips, bars and highlights. */
  accent: string
  /** Default button fill (contained) or border and label (outlined). */
  button: string
  /** Default button label colour for contained buttons. */
  buttonLabel: string
}

const CARD_ALPHA = 0.12
const MUTED_ALPHA = 0.7
const BORDER_ALPHA = 0.12

export type CampaignBandOverlay = 'light' | 'medium' | 'heavy'

/** `backgroundOverlay` → the dark overlay's alpha over an `image` cover (PRD §4); null ⇒ medium. */
export const CAMPAIGN_OVERLAY_ALPHA: Record<CampaignBandOverlay, number> = {
  light: 0.3,
  medium: 0.55,
  heavy: 0.75
}

export function overlayAlpha(
  overlay: CampaignBandOverlay | null | undefined
): number {
  return CAMPAIGN_OVERLAY_ALPHA[overlay ?? 'medium']
}

const { palette } = createTheme()

/**
 * Text over a coloured surface, computed by luminance with MUI's
 * `getContrastText`; never stored or hard-coded.
 */
export function contrastText(background: string): string {
  return palette.getContrastText(background)
}

function tableRow(
  section: CampaignBandSection,
  theme: CampaignBandTheme
): Omit<ResolvedBand, 'heading' | 'border'> {
  const onPrimary = contrastText(theme.primaryColor)
  const primaryButton = { button: theme.primaryColor, buttonLabel: onPrimary }

  switch (section.backgroundKind) {
    case 'surface':
      return {
        background: theme.surfaceColor,
        text: theme.textColor,
        muted: theme.mutedColor,
        card: theme.backgroundColor,
        eyebrow: theme.primaryColor,
        accent: theme.accentColor,
        ...primaryButton
      }
    case 'primary':
      return {
        background: theme.primaryColor,
        text: onPrimary,
        muted: alpha(onPrimary, MUTED_ALPHA),
        card: alpha(onPrimary, CARD_ALPHA),
        eyebrow: onPrimary,
        accent: theme.accentColor,
        button: onPrimary,
        buttonLabel: theme.primaryColor
      }
    case 'contrast':
      return {
        background: theme.contrastBackgroundColor,
        text: theme.contrastTextColor,
        muted: alpha(theme.contrastTextColor, MUTED_ALPHA),
        card: alpha(theme.contrastTextColor, CARD_ALPHA),
        eyebrow: theme.accentColor,
        accent: theme.accentColor,
        button: theme.accentColor,
        buttonLabel: contrastText(theme.accentColor)
      }
    case 'custom': {
      const background = section.backgroundColor ?? theme.backgroundColor
      const text = contrastText(background)
      return {
        background,
        text,
        muted: alpha(text, MUTED_ALPHA),
        card: alpha(text, CARD_ALPHA),
        eyebrow: theme.primaryColor,
        accent: theme.accentColor,
        ...primaryButton
      }
    }
    case 'image':
      return {
        background: theme.contrastBackgroundColor,
        text: '#FFFFFF',
        muted: alpha('#FFFFFF', MUTED_ALPHA),
        card: 'rgba(0, 0, 0, 0.4)',
        eyebrow: theme.accentColor,
        accent: theme.accentColor,
        ...primaryButton
      }
    case 'none':
    default:
      return {
        background: theme.backgroundColor,
        text: theme.textColor,
        muted: theme.mutedColor,
        card: theme.surfaceColor,
        eyebrow: theme.primaryColor,
        accent: theme.accentColor,
        ...primaryButton
      }
  }
}

/**
 * The band resolution table (PRD §4): `backgroundKind` × theme → the colours
 * a section band paints with, then the section's five overrides layered on
 * top of every row. The button fallback chain's last two links live here
 * (section `buttonColor` → table); a button's own hex is applied by the
 * button itself.
 */
export function resolveBand(
  section: CampaignBandSection,
  theme: CampaignBandTheme
): ResolvedBand {
  const row = tableRow(section, theme)
  const text = section.textColor ?? row.text
  return {
    ...row,
    text,
    heading: section.headingColor ?? text,
    muted:
      section.textColor != null ? alpha(section.textColor, MUTED_ALPHA) : row.muted,
    border: alpha(text, BORDER_ALPHA),
    eyebrow: section.accentColor ?? row.eyebrow,
    accent: section.accentColor ?? row.accent,
    button: section.buttonColor ?? row.button,
    buttonLabel:
      section.buttonTextColor ??
      (section.buttonColor != null
        ? contrastText(section.buttonColor)
        : row.buttonLabel)
  }
}

/** The CSS custom properties a band exposes to everything inside it. */
export function bandCssVariables(band: ResolvedBand): Record<string, string> {
  return {
    '--campaign-band-background': band.background,
    '--campaign-band-text': band.text,
    '--campaign-band-heading': band.heading,
    '--campaign-band-muted': band.muted,
    '--campaign-band-card': band.card,
    '--campaign-band-border': band.border,
    '--campaign-band-eyebrow': band.eyebrow,
    '--campaign-band-accent': band.accent,
    '--campaign-band-button': band.button,
    '--campaign-band-button-label': band.buttonLabel
  }
}
