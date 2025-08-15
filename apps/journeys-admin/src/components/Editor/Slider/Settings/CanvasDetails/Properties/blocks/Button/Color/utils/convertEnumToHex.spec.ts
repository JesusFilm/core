import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { ButtonColor } from '../../../../../../../../../../../__generated__/globalTypes'

import { convertEnumToHex } from './convertEnumToHex'

jest.mock('@core/shared/ui/themes', () => ({
  ThemeMode: {
    light: 'light',
    dark: 'dark'
  },
  ThemeName: {
    base: 'base',
    website: 'website',
    journeyUi: 'journeyUi',
    journeysAdmin: 'journeysAdmin'
  },
  getTheme: jest.fn().mockImplementation(({ themeName, themeMode }) => {
    if (themeName === 'website' && themeMode === 'dark') {
      return {
        palette: {
          primary: { main: '#123456' },
          secondary: { main: '#654321' },
          error: { main: '#ff0000' }
        }
      }
    }
    if (themeName === 'website' && themeMode === 'light') {
      return {
        palette: {
          primary: { main: '#abcdef' },
          secondary: { main: '#fedcba' },
          error: { main: '#ff5555' }
        }
      }
    }
    if (themeName === 'base' && themeMode === 'dark') {
      return {
        palette: {
          primary: { main: '#111111' },
          secondary: { main: '#222222' },
          error: { main: '#333333' }
        }
      }
    }
    return {
      palette: {
        primary: { main: '#ffffff' },
        secondary: { main: '#eeeeee' },
        error: { main: '#dddddd' }
      }
    }
  })
}))

describe('convertEnumToHex', () => {
  describe('base theme', () => {
    describe('light mode', () => {
      it('should return primary color', () => {
        const result = convertEnumToHex(
          ThemeName.base,
          ThemeMode.light,
          ButtonColor.primary
        )
        expect(result).toBe('#ffffff')
      })

      it('should return secondary color', () => {
        const result = convertEnumToHex(
          ThemeName.base,
          ThemeMode.light,
          ButtonColor.secondary
        )
        expect(result).toBe('#eeeeee')
      })

      it('should return error color', () => {
        const result = convertEnumToHex(
          ThemeName.base,
          ThemeMode.light,
          ButtonColor.error
        )
        expect(result).toBe('#dddddd')
      })
    })

    describe('dark mode', () => {
      it('should return primary color', () => {
        const result = convertEnumToHex(
          ThemeName.base,
          ThemeMode.dark,
          ButtonColor.primary
        )
        expect(result).toBe('#111111')
      })
    })
  })

  describe('website theme', () => {
    describe('light mode', () => {
      it('should return primary color', () => {
        const result = convertEnumToHex(
          ThemeName.website,
          ThemeMode.light,
          ButtonColor.primary
        )
        expect(result).toBe('#abcdef')
      })

      it('should return secondary color', () => {
        const result = convertEnumToHex(
          ThemeName.website,
          ThemeMode.light,
          ButtonColor.secondary
        )
        expect(result).toBe('#fedcba')
      })

      it('should return error color', () => {
        const result = convertEnumToHex(
          ThemeName.website,
          ThemeMode.light,
          ButtonColor.error
        )
        expect(result).toBe('#ff5555')
      })
    })

    describe('dark mode', () => {
      it('should return primary color', () => {
        const result = convertEnumToHex(
          ThemeName.website,
          ThemeMode.dark,
          ButtonColor.primary
        )
        expect(result).toBe('#123456')
      })

      it('should return secondary color', () => {
        const result = convertEnumToHex(
          ThemeName.website,
          ThemeMode.dark,
          ButtonColor.secondary
        )
        expect(result).toBe('#654321')
      })

      it('should return error color', () => {
        const result = convertEnumToHex(
          ThemeName.website,
          ThemeMode.dark,
          ButtonColor.error
        )
        expect(result).toBe('#ff0000')
      })
    })
  })

  describe('edge cases', () => {
    it('should handle null theme values by using defaults', () => {
      // @ts-expect-error Testing with null values
      const result = convertEnumToHex(null, null, ButtonColor.primary)
      expect(result).toBe('#ffffff')
    })
  })
})
