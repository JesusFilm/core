import { Theme } from '@mui/material/styles'

import { getPollOptionBorderStyles } from '.'

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

  describe('light theme', () => {
    let styles: ReturnType<typeof getPollOptionBorderStyles>

    beforeEach(() => {
      styles = getPollOptionBorderStyles(mockLightTheme)
    })

    it('should return correct default border styles for light theme', () => {
      expect(styles.borderColor).toBe('rgba(225, 225, 225, 0.3)')
      expect(styles.borderWidth).toBe('1px ')
      expect(styles.borderStyle).toBe('solid')
    })

    it('should return correct hover border styles for light theme', () => {
      expect(styles['&:hover'].borderColor).toBe('rgba(255, 255, 255, 0.5)')
    })

    it('should return correct selected border styles for light theme', () => {
      expect(styles['&.selected'].borderColor).toBe('rgba(255, 255, 255, 0.7)')
    })

    it('should return correct disabled border styles for light theme', () => {
      expect(styles['&.disabled'].borderColor).toBe('rgba(255, 255, 255, 0.15)')
    })
  })

  describe('dark theme', () => {
    let styles: ReturnType<typeof getPollOptionBorderStyles>

    beforeEach(() => {
      styles = getPollOptionBorderStyles(mockDarkTheme)
    })

    it('should return correct default border styles for dark theme', () => {
      expect(styles.borderColor).toBe('rgba(150, 150, 150, 0.2)')
      expect(styles.borderWidth).toBe('1px ')
      expect(styles.borderStyle).toBe('solid')
    })

    it('should return correct hover border styles for dark theme', () => {
      expect(styles['&:hover'].borderColor).toBe('rgba(150, 150, 150, 0.5)')
    })

    it('should return correct selected border styles for dark theme', () => {
      expect(styles['&.selected'].borderColor).toBe('rgba(150, 150, 150, 0.7)')
    })

    it('should return correct disabled border styles for dark theme', () => {
      expect(styles['&.disabled'].borderColor).toBe('rgba(150, 150, 150, 0.15)')
    })
  })

  describe('options', () => {
    it('should handle important', () => {
      const styles = getPollOptionBorderStyles(mockLightTheme, {
        important: true
      })

      expect(styles.borderColor).toBe('rgba(225, 225, 225, 0.3) !important')
      expect(styles.borderWidth).toBe('1px !important')
      expect(styles.borderStyle).toBe('solid !important')
    })
  })

  describe('return value structure', () => {
    it('should return an object with correct structure for light theme', () => {
      const styles = getPollOptionBorderStyles(mockLightTheme)

      expect(styles).toEqual({
        borderColor: 'rgba(225, 225, 225, 0.3)',
        borderWidth: '1px ',
        borderStyle: 'solid',
        '&:hover': {
          borderColor: 'rgba(255, 255, 255, 0.5)'
        },
        '&.selected': {
          borderColor: 'rgba(255, 255, 255, 0.7)'
        },
        '&.disabled': {
          borderColor: 'rgba(255, 255, 255, 0.15)'
        }
      })
    })

    it('should return an object with correct structure for dark theme', () => {
      const styles = getPollOptionBorderStyles(mockDarkTheme)

      expect(styles).toEqual({
        borderColor: 'rgba(150, 150, 150, 0.2)',
        borderWidth: '1px ',
        borderStyle: 'solid',
        '&:hover': {
          borderColor: 'rgba(150, 150, 150, 0.5)'
        },
        '&.selected': {
          borderColor: 'rgba(150, 150, 150, 0.7)'
        },
        '&.disabled': {
          borderColor: 'rgba(150, 150, 150, 0.15)'
        }
      })
    })
  })
})
