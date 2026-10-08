import type {
  CampaignThemeInput,
  CampaignThemeMode
} from '../createCampaignTheme'

/**
 * A Theme Preset: theme mode plus the eight colour columns of a Campaign
 * Theme. Applying one replaces mode and colours only; fonts and both radii are
 * untouched. Nothing records which preset is active: the editor derives it by
 * comparing the current values to these constants (PRD §4, §14).
 */
export interface CampaignThemePreset {
  themeMode: CampaignThemeMode
  primaryColor: string
  accentColor: string
  backgroundColor: string
  surfaceColor: string
  textColor: string
  mutedColor: string
  contrastBackgroundColor: string
  contrastTextColor: string
}

export type CampaignThemePresetName = 'light' | 'dark'

/** What the editor shows for the current values: a preset's name, or custom. */
export type CampaignThemePresetLabel = CampaignThemePresetName | 'custom'

/** The eight colour columns a preset sets, in table order (primary first). */
export const PRESET_COLOR_COLUMNS = [
  'primaryColor',
  'accentColor',
  'backgroundColor',
  'surfaceColor',
  'textColor',
  'mutedColor',
  'contrastBackgroundColor',
  'contrastTextColor'
] as const

export type CampaignThemePresetColumn = (typeof PRESET_COLOR_COLUMNS)[number]

/** The nine columns a preset replaces: the mode and the eight colours. */
export const PRESET_COLUMNS = ['themeMode', ...PRESET_COLOR_COLUMNS] as const

export const LIGHT_PRESET: CampaignThemePreset = {
  themeMode: 'light',
  primaryColor: '#C52D3A',
  accentColor: '#F2B544',
  backgroundColor: '#FBF7F1',
  surfaceColor: '#FFFFFF',
  textColor: '#26262E',
  mutedColor: '#6D6F81',
  contrastBackgroundColor: '#26262E',
  contrastTextColor: '#FFFFFF'
}

export const DARK_PRESET: CampaignThemePreset = {
  themeMode: 'dark',
  primaryColor: '#E63946',
  accentColor: '#F2B544',
  backgroundColor: '#0E0E12',
  surfaceColor: '#1A1A22',
  textColor: '#FFFFFF',
  mutedColor: '#B9BAC6',
  contrastBackgroundColor: '#F5F2EC',
  contrastTextColor: '#1A1A22'
}

export const CAMPAIGN_THEME_PRESETS: Record<
  CampaignThemePresetName,
  CampaignThemePreset
> = {
  light: LIGHT_PRESET,
  dark: DARK_PRESET
}

/** A preset's colours in table order, primary first. */
export function presetColors(preset: CampaignThemePreset): string[] {
  return PRESET_COLOR_COLUMNS.map((column) => preset[column])
}

/**
 * Which preset the nine values match, or `custom` when they match neither.
 * Colours compare case-insensitively so a `#ffffff` read back from an older
 * row still counts; nothing is stored.
 */
export function activeThemePreset(
  theme: Pick<CampaignThemeInput, (typeof PRESET_COLUMNS)[number]>
): CampaignThemePresetLabel {
  for (const name of ['light', 'dark'] as const) {
    const preset = CAMPAIGN_THEME_PRESETS[name]
    const matches = PRESET_COLUMNS.every(
      (column) => theme[column].toUpperCase() === preset[column].toUpperCase()
    )
    if (matches) return name
  }
  return 'custom'
}
