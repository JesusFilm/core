import type { CampaignThemeInput } from '../createCampaignTheme'

import {
  DARK_PRESET,
  LIGHT_PRESET,
  PRESET_COLOR_COLUMNS,
  activeThemePreset,
  presetColors
} from './themePresets'

const light: CampaignThemeInput = {
  ...LIGHT_PRESET,
  headerFont: null,
  bodyFont: null,
  labelFont: null,
  radius: 'rounded',
  buttonRadius: 'veryRounded'
}

describe('themePresets', () => {
  it('lists one colour per colour column, primary first', () => {
    const colors = presetColors(LIGHT_PRESET)
    expect(colors[0]).toBe(LIGHT_PRESET.primaryColor)
    expect(colors).toHaveLength(PRESET_COLOR_COLUMNS.length)
  })

  describe('activeThemePreset', () => {
    it('names the preset the ten values match, whatever the fonts and the corner radius', () => {
      expect(activeThemePreset(light)).toBe('light')
      const dark: CampaignThemeInput = {
        ...light,
        ...DARK_PRESET,
        headerFont: 'Oswald',
        radius: 'square'
      }
      expect(activeThemePreset(dark)).toBe('dark')
    })

    it('is custom when any of the ten values differs', () => {
      expect(activeThemePreset({ ...light, accentColor: '#123456' })).toBe(
        'custom'
      )
      expect(activeThemePreset({ ...light, themeMode: 'dark' })).toBe('custom')
      expect(activeThemePreset({ ...light, buttonRadius: 'slight' })).toBe(
        'custom'
      )
    })

    it('compares colours case-insensitively', () => {
      expect(activeThemePreset({ ...light, surfaceColor: '#ffffff' })).toBe(
        'light'
      )
    })
  })
})
