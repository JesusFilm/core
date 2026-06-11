import { SupportedColorScheme, useColorScheme } from '@mui/material/styles'
import { ColorSchemeContextValue } from '@mui/system/cssVars'
import { fireEvent, render, screen } from '@testing-library/react'
import { type MockedFunction } from 'vitest'

import { ToggleColorMode } from './ToggleColorMode'

vi.mock('@mui/material/styles', async () => ({
  ...(await vi.importActual('@mui/material/styles')),
  useColorScheme: vi.fn()
}))

const mockColorScheme = useColorScheme as MockedFunction<typeof useColorScheme>

describe('ToggleColorMode', () => {
  it('should toggle the theme on click', () => {
    const setMode = vi.fn()
    mockColorScheme.mockReturnValue({
      mode: 'light',
      setMode
    } as unknown as ColorSchemeContextValue<SupportedColorScheme>)
    render(<ToggleColorMode />)

    fireEvent.click(screen.getByTestId('ToggleColorModeDark'))
    expect(setMode).toHaveBeenCalledWith('dark')
  })
})
