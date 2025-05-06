import { SupportedColorScheme, useColorScheme } from '@mui/material/styles'
import { ColorSchemeContextValue } from '@mui/system/cssVars'
import { fireEvent, render, screen } from '@testing-library/react'

import { ToggleColorMode } from './ToggleColorMode'

jest.mock('@mui/material/styles', () => ({
  ...jest.requireActual('@mui/material/styles'),
  useColorScheme: jest.fn()
}))

const mockColorScheme = useColorScheme as jest.MockedFunction<
  typeof useColorScheme
>

describe('ToggleColorMode', () => {
  it('should toggle the theme on click', () => {
    const setMode = jest.fn()
    mockColorScheme.mockReturnValue({
      mode: 'light',
      setMode
    } as unknown as ColorSchemeContextValue<SupportedColorScheme>)
    render(<ToggleColorMode />)

    fireEvent.click(screen.getByTestId('ToggleColorModeDark'))
    expect(setMode).toHaveBeenCalledWith('dark')
  })
})
