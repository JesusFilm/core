/**
 * The Theme Presets are code constants shared with the editor and the viewer
 * (`libs/journeys/ui`), so the seed, the panel's Light / Dark / Custom label
 * and the renderer agree on the same nine values.
 */
export {
  CAMPAIGN_THEME_PRESETS,
  DARK_PRESET,
  LIGHT_PRESET,
  PRESET_COLOR_COLUMNS,
  PRESET_COLUMNS,
  presetColors
} from '@core/journeys/ui/Campaign/libs/themePresets'
export type {
  CampaignThemePreset,
  CampaignThemePresetColumn
} from '@core/journeys/ui/Campaign/libs/themePresets'
