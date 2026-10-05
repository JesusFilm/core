import { Theme } from '@mui/material/styles'

import { getPollOptionBorderColors, getPollOptionBorderStyles } from '.'

describe('getPollOptionBorderStyles', () => {
  const mockLightTheme = {
    palette: {
      mode: 'light'
    }
  } as Theme

  const mockDarkTheme = {
    palette: {
      mode: 'dark'
    }
  } as Theme

  describe('getPollOptionBorderStyles', () => {
    it('should return base border styles for light theme', () => {
      expect(getPollOptionBorderStyles(mockLightTheme)).toEqual({
        borderColor: 'rgba(225, 225, 225, 0.3)',
        borderWidth: '1px',
        borderStyle: 'solid'
      })
    })

    it('should return base border styles for dark theme', () => {
      expect(getPollOptionBorderStyles(mockDarkTheme)).toEqual({
        borderColor: 'rgba(150, 150, 150, 0.2)',
        borderWidth: '1px',
        borderStyle: 'solid'
      })
    })

    it('should not return state selectors, so callers own them', () => {
      const styles = getPollOptionBorderStyles(mockLightTheme)

      expect(styles).not.toHaveProperty('&:hover')
      expect(styles).not.toHaveProperty('&:active')
      expect(styles).not.toHaveProperty('&.disabled')
    })

    it('should handle important', () => {
      expect(
        getPollOptionBorderStyles(mockLightTheme, { important: true })
      ).toEqual({
        borderColor: 'rgba(225, 225, 225, 0.3) !important',
        borderWidth: '1px !important',
        borderStyle: 'solid !important'
      })
    })
  })

  describe('getPollOptionBorderColors', () => {
    it('should return a colour per state for light theme', () => {
      expect(getPollOptionBorderColors(mockLightTheme)).toEqual({
        default: 'rgba(225, 225, 225, 0.3)',
        hover: 'rgba(255, 255, 255, 0.5)',
        active: 'rgba(255, 255, 255, 0.7)',
        disabled: 'rgba(255, 255, 255, 0.15)'
      })
    })

    it('should return a colour per state for dark theme', () => {
      expect(getPollOptionBorderColors(mockDarkTheme)).toEqual({
        default: 'rgba(150, 150, 150, 0.2)',
        hover: 'rgba(150, 150, 150, 0.5)',
        active: 'rgba(150, 150, 150, 0.7)',
        disabled: 'rgba(150, 150, 150, 0.15)'
      })
    })

    it('should handle important', () => {
      expect(
        getPollOptionBorderColors(mockDarkTheme, { important: true })
      ).toEqual({
        default: 'rgba(150, 150, 150, 0.2) !important',
        hover: 'rgba(150, 150, 150, 0.5) !important',
        active: 'rgba(150, 150, 150, 0.7) !important',
        disabled: 'rgba(150, 150, 150, 0.15) !important'
      })
    })
  })
})
