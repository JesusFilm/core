import type { CampaignThemeInput } from '../createCampaignTheme'

import {
  DARK_PRESET,
  LIGHT_PRESET,
  activeThemePreset,
  presetColors
} from './themePresets'

const light: CampaignThemeInput = {
  ...LIGHT_PRESET,
  headerFont: null,
  bodyFont: null,
  labelFont: null,
  radius: 'rounded',
  buttonRadius: 'pill'
}

describe('themePresets', () => {
  it('lists a preset’s colours in table order, primary first', () => {
    expect(presetColors(LIGHT_PRESET)).toEqual([
      '#C52D3A',
      '#F2B544',
      '#FBF7F1',
      '#FFFFFF',
      '#26262E',
      '#6D6F81',
      '#26262E',
      '#FFFFFF'
    ])
  })

  describe('activeThemePreset', () => {
    it('names the preset the nine values match, whatever the fonts and radii', () => {
      expect(activeThemePreset(light)).toBe('light')
      const dark: CampaignThemeInput = {
        ...light,
        ...DARK_PRESET,
        headerFont: 'Oswald',
        radius: 'square',
        buttonRadius: 'rounded'
      }
      expect(activeThemePreset(dark)).toBe('dark')
    })

    it('is custom when any of the nine values differs', () => {
      expect(activeThemePreset({ ...light, accentColor: '#123456' })).toBe(
        'custom'
      )
      expect(activeThemePreset({ ...light, themeMode: 'dark' })).toBe('custom')
    })

    it('compares colours case-insensitively', () => {
      expect(activeThemePreset({ ...light, surfaceColor: '#ffffff' })).toBe(
        'light'
      )
    })
  })
})
