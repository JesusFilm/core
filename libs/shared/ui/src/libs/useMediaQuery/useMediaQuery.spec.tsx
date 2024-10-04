import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles'
import { renderHook } from '@testing-library/react'

import { useMediaQuery } from './useMediaQuery'

describe('useMediaQuery', () => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    }))
  })

  it('should return boolean if media query matches', () => {
    const { result } = renderHook(
      () => {
        const theme = useTheme()

        return useMediaQuery(theme.breakpoints.up('sm'))
      },
      {
        wrapper: ({ children }) => (
          <ThemeProvider theme={createTheme()}>{children}</ThemeProvider>
        )
      }
    )
    expect(result.current).toBe(false)
  })

  it('should throw error if theme breakpoints is not added in', () => {
    expect(() => useMediaQuery('(max-width:600px)')).toThrow(
      "please pass in MUI theme breakpoints e.g. theme.breakpoints.up('sm')"
    )
  })
})
