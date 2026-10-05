import { ThemeMode } from '@core/prisma/journeys/client'

/**
 * A Theme Preset: theme mode plus the eight colour columns of a Campaign
 * Theme. Applying one replaces mode and colours only; fonts and both radii are
 * untouched. Nothing records which preset is active.
 */
export interface CampaignThemePreset {
  themeMode: ThemeMode
  primaryColor: string
  accentColor: string
  backgroundColor: string
  surfaceColor: string
  textColor: string
  mutedColor: string
  contrastBackgroundColor: string
  contrastTextColor: string
}

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

/** A preset's colours in table order, primary first. */
export function presetColors(preset: CampaignThemePreset): string[] {
  return PRESET_COLOR_COLUMNS.map((column) => preset[column])
}
