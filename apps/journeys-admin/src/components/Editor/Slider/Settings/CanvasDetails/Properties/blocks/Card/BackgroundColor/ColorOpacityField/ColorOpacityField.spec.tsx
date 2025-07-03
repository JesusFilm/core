import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { ColorOpacityField } from './ColorOpacityField'

const ThemeWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.light}>
    {children}
  </ThemeProvider>
)

describe('ColorOpacityField', () => {
  const mockOnColorChange = jest.fn()
  const mockOnEditClick = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initial Rendering', () => {
    it('displays initial color and opacity values correctly', () => {
      render(
        <ThemeWrapper>
          <ColorOpacityField
            color="#FF0000FF"
            onColorChange={mockOnColorChange}
            onEditClick={mockOnEditClick}
          />
        </ThemeWrapper>
      )

      const colorInput = screen
        .getByTestId('bgColorTextField')
        .querySelector('input')
      const opacityInput = screen
        .getByTestId('bgOpacityTextField')
        .querySelector('input')

      expect(colorInput).toHaveValue('#FF0000')
      expect(opacityInput).toHaveValue('100')
    })

    it('handles 6-digit hex colors with default 100% opacity', () => {
      render(
        <ThemeWrapper>
          <ColorOpacityField
            color="#00FF00"
            onColorChange={mockOnColorChange}
            onEditClick={mockOnEditClick}
          />
        </ThemeWrapper>
      )

      const colorInput = screen
        .getByTestId('bgColorTextField')
        .querySelector('input')
      const opacityInput = screen
        .getByTestId('bgOpacityTextField')
        .querySelector('input')

      expect(colorInput).toHaveValue('#00FF00')
      expect(opacityInput).toHaveValue('100')
    })

    it('extracts opacity from 8-digit hex colors', () => {
      render(
        <ThemeWrapper>
          <ColorOpacityField
            color="#0000FF80"
            onColorChange={mockOnColorChange}
            onEditClick={mockOnEditClick}
          />
        </ThemeWrapper>
      )

      const colorInput = screen
        .getByTestId('bgColorTextField')
        .querySelector('input')
      const opacityInput = screen
        .getByTestId('bgOpacityTextField')
        .querySelector('input')

      expect(colorInput).toHaveValue('#0000FF')
      expect(opacityInput).toHaveValue('50') // 0x80 = 128, (128/255)*100 ≈ 50%
    })

    it('displays edit icon in color field', () => {
      render(
        <ThemeWrapper>
          <ColorOpacityField
            color="#FF0000"
            onColorChange={mockOnColorChange}
            onEditClick={mockOnEditClick}
          />
        </ThemeWrapper>
      )

      expect(screen.getByTestId('Edit2Icon')).toBeInTheDocument()
    })

    it('displays percentage symbol in opacity field', () => {
      render(
        <ThemeWrapper>
          <ColorOpacityField
            color="#FF0000"
            onColorChange={mockOnColorChange}
            onEditClick={mockOnEditClick}
          />
        </ThemeWrapper>
      )

      expect(screen.getByText('%')).toBeInTheDocument()
    })
  })

  describe('Color Input Validation', () => {
    it('accepts valid 6-digit hex colors', async () => {
      render(
        <ThemeWrapper>
          <ColorOpacityField
            color="#000000"
            onColorChange={mockOnColorChange}
            onEditClick={mockOnEditClick}
          />
        </ThemeWrapper>
      )

      const colorInput = screen
        .getByTestId('bgColorTextField')
        .querySelector('input')

      await userEvent.clear(colorInput as HTMLInputElement)
      await userEvent.type(colorInput as HTMLInputElement, '#ABCDEF')
      fireEvent.blur(colorInput as HTMLInputElement)

      await waitFor(() => {
        expect(mockOnColorChange).toHaveBeenCalledWith('#ABCDEFFF')
      })
    })

    it('accepts valid 8-digit hex colors and extracts opacity', async () => {
      render(
        <ThemeWrapper>
          <ColorOpacityField
            color="#000000"
            onColorChange={mockOnColorChange}
            onEditClick={mockOnEditClick}
          />
        </ThemeWrapper>
      )

      const colorInput = screen
        .getByTestId('bgColorTextField')
        .querySelector('input')
      const opacityInput = screen
        .getByTestId('bgOpacityTextField')
        .querySelector('input')

      await userEvent.clear(colorInput as HTMLInputElement)
      await userEvent.type(colorInput as HTMLInputElement, '#ABCDEF80')
      fireEvent.blur(colorInput as HTMLInputElement)

      await waitFor(() => {
        expect(colorInput).toHaveValue('#ABCDEF')
        expect(opacityInput).toHaveValue('50') // 0x80 = 50%
        expect(mockOnColorChange).toHaveBeenCalledWith('#ABCDEF80')
      })
    })

    it('rejects invalid hex colors and resets to previous value', async () => {
      render(
        <ThemeWrapper>
          <ColorOpacityField
            color="#FF0000"
            onColorChange={mockOnColorChange}
            onEditClick={mockOnEditClick}
          />
        </ThemeWrapper>
      )

      const colorInput = screen
        .getByTestId('bgColorTextField')
        .querySelector('input')

      await userEvent.clear(colorInput as HTMLInputElement)
      await userEvent.type(colorInput as HTMLInputElement, 'invalid')
      fireEvent.blur(colorInput as HTMLInputElement)

      await waitFor(() => {
        expect(colorInput).toHaveValue('#FF0000')
        expect(mockOnColorChange).not.toHaveBeenCalled()
      })
    })

    it('rejects empty color input and resets to previous value', async () => {
      render(
        <ThemeWrapper>
          <ColorOpacityField
            color="#FF0000"
            onColorChange={mockOnColorChange}
            onEditClick={mockOnEditClick}
          />
        </ThemeWrapper>
      )

      const colorInput = screen
        .getByTestId('bgColorTextField')
        .querySelector('input')

      await userEvent.clear(colorInput as HTMLInputElement)
      fireEvent.blur(colorInput as HTMLInputElement)

      await waitFor(() => {
        expect(colorInput).toHaveValue('#FF0000')
        expect(mockOnColorChange).not.toHaveBeenCalled()
      })
    })

    it('handles color changes via Enter key', async () => {
      render(
        <ThemeWrapper>
          <ColorOpacityField
            color="#000000"
            onColorChange={mockOnColorChange}
            onEditClick={mockOnEditClick}
          />
        </ThemeWrapper>
      )

      const colorInput = screen
        .getByTestId('bgColorTextField')
        .querySelector('input')

      await userEvent.clear(colorInput as HTMLInputElement)
      await userEvent.type(colorInput as HTMLInputElement, '#123456')
      fireEvent.keyDown(colorInput as HTMLInputElement, { key: 'Enter' })

      await waitFor(() => {
        expect(mockOnColorChange).toHaveBeenCalledWith('#123456FF')
      })
    })

    it('handles 8-digit hex color via Enter key', async () => {
      render(
        <ThemeWrapper>
          <ColorOpacityField
            color="#000000"
            onColorChange={mockOnColorChange}
            onEditClick={mockOnEditClick}
          />
        </ThemeWrapper>
      )

      const colorInput = screen
        .getByTestId('bgColorTextField')
        .querySelector('input')
      const opacityInput = screen
        .getByTestId('bgOpacityTextField')
        .querySelector('input')

      await userEvent.clear(colorInput as HTMLInputElement)
      await userEvent.type(colorInput as HTMLInputElement, '#123456AA')
      fireEvent.keyDown(colorInput as HTMLInputElement, { key: 'Enter' })

      await waitFor(() => {
        expect(colorInput).toHaveValue('#123456')
        expect(opacityInput).toHaveValue('67') // 0xAA ≈ 67%
        expect(mockOnColorChange).toHaveBeenCalledWith('#123456AB')
      })
    })
  })

  describe('Opacity Input Validation', () => {
    it('accepts valid opacity values (0-100)', async () => {
      render(
        <ThemeWrapper>
          <ColorOpacityField
            color="#FF0000"
            onColorChange={mockOnColorChange}
            onEditClick={mockOnEditClick}
          />
        </ThemeWrapper>
      )

      const opacityInput = screen
        .getByTestId('bgOpacityTextField')
        .querySelector('input')

      await userEvent.clear(opacityInput as HTMLInputElement)
      await userEvent.type(opacityInput as HTMLInputElement, '75')
      fireEvent.blur(opacityInput as HTMLInputElement)

      await waitFor(() => {
        expect(mockOnColorChange).toHaveBeenCalledWith('#FF0000BF') // 75% = 0xBF
      })
    })

    it('accepts boundary values (0 and 100)', async () => {
      render(
        <ThemeWrapper>
          <ColorOpacityField
            color="#FF0000"
            onColorChange={mockOnColorChange}
            onEditClick={mockOnEditClick}
          />
        </ThemeWrapper>
      )

      const opacityInput = screen
        .getByTestId('bgOpacityTextField')
        .querySelector('input')

      // Test 0%
      await userEvent.clear(opacityInput as HTMLInputElement)
      await userEvent.type(opacityInput as HTMLInputElement, '0')
      fireEvent.blur(opacityInput as HTMLInputElement)

      await waitFor(() => {
        expect(mockOnColorChange).toHaveBeenCalledWith('#FF000000')
      })

      jest.clearAllMocks()

      // Test 100%
      await userEvent.clear(opacityInput as HTMLInputElement)
      await userEvent.type(opacityInput as HTMLInputElement, '100')
      fireEvent.blur(opacityInput as HTMLInputElement)

      await waitFor(() => {
        expect(mockOnColorChange).toHaveBeenCalledWith('#FF0000FF')
      })
    })

    it('rejects opacity values above 100 and resets to previous value', async () => {
      render(
        <ThemeWrapper>
          <ColorOpacityField
            color="#FF0000FF"
            onColorChange={mockOnColorChange}
            onEditClick={mockOnEditClick}
          />
        </ThemeWrapper>
      )

      const opacityInput = screen
        .getByTestId('bgOpacityTextField')
        .querySelector('input')

      await userEvent.clear(opacityInput as HTMLInputElement)
      await userEvent.type(opacityInput as HTMLInputElement, '150')
      fireEvent.blur(opacityInput as HTMLInputElement)

      await waitFor(() => {
        expect(opacityInput).toHaveValue('100')
        expect(mockOnColorChange).not.toHaveBeenCalled()
      })
    })

    it('rejects negative opacity values and resets to previous value', async () => {
      render(
        <ThemeWrapper>
          <ColorOpacityField
            color="#FF0000FF"
            onColorChange={mockOnColorChange}
            onEditClick={mockOnEditClick}
          />
        </ThemeWrapper>
      )

      const opacityInput = screen
        .getByTestId('bgOpacityTextField')
        .querySelector('input')

      await userEvent.clear(opacityInput as HTMLInputElement)
      await userEvent.type(opacityInput as HTMLInputElement, '-10')
      fireEvent.blur(opacityInput as HTMLInputElement)

      await waitFor(() => {
        expect(opacityInput).toHaveValue('100')
        expect(mockOnColorChange).not.toHaveBeenCalled()
      })
    })

    it('rejects non-numeric opacity values and resets to previous value', async () => {
      render(
        <ThemeWrapper>
          <ColorOpacityField
            color="#FF0000FF"
            onColorChange={mockOnColorChange}
            onEditClick={mockOnEditClick}
          />
        </ThemeWrapper>
      )

      const opacityInput = screen
        .getByTestId('bgOpacityTextField')
        .querySelector('input')

      await userEvent.clear(opacityInput as HTMLInputElement)
      await userEvent.type(opacityInput as HTMLInputElement, 'abc')
      fireEvent.blur(opacityInput as HTMLInputElement)

      await waitFor(() => {
        expect(opacityInput).toHaveValue('100')
        expect(mockOnColorChange).not.toHaveBeenCalled()
      })
    })

    it('handles opacity changes via Enter key', async () => {
      render(
        <ThemeWrapper>
          <ColorOpacityField
            color="#FF0000"
            onColorChange={mockOnColorChange}
            onEditClick={mockOnEditClick}
          />
        </ThemeWrapper>
      )

      const opacityInput = screen
        .getByTestId('bgOpacityTextField')
        .querySelector('input')

      await userEvent.clear(opacityInput as HTMLInputElement)
      await userEvent.type(opacityInput as HTMLInputElement, '25')
      fireEvent.keyDown(opacityInput as HTMLInputElement, { key: 'Enter' })

      await waitFor(() => {
        expect(mockOnColorChange).toHaveBeenCalledWith('#FF000040') // 25% = 0x40
      })
    })

    it('handles integer opacity values correctly', async () => {
      render(
        <ThemeWrapper>
          <ColorOpacityField
            color="#FF0000"
            onColorChange={mockOnColorChange}
            onEditClick={mockOnEditClick}
          />
        </ThemeWrapper>
      )

      const opacityInput = screen
        .getByTestId('bgOpacityTextField')
        .querySelector('input')

      await userEvent.clear(opacityInput as HTMLInputElement)
      await userEvent.type(opacityInput as HTMLInputElement, '51')
      fireEvent.blur(opacityInput as HTMLInputElement)

      await waitFor(() => {
        expect(mockOnColorChange).toHaveBeenCalledWith('#FF000082') // 51% = 0x82
      })
    })
  })

  describe('Combined Color and Opacity Changes', () => {
    it('combines color and opacity changes correctly', async () => {
      render(
        <ThemeWrapper>
          <ColorOpacityField
            color="#000000"
            onColorChange={mockOnColorChange}
            onEditClick={mockOnEditClick}
          />
        </ThemeWrapper>
      )

      const colorInput = screen
        .getByTestId('bgColorTextField')
        .querySelector('input')
      const opacityInput = screen
        .getByTestId('bgOpacityTextField')
        .querySelector('input')

      // Change color first
      await userEvent.clear(colorInput as HTMLInputElement)
      await userEvent.type(colorInput as HTMLInputElement, '#ABCDEF')
      fireEvent.blur(colorInput as HTMLInputElement)

      await waitFor(() => {
        expect(mockOnColorChange).toHaveBeenCalledWith('#ABCDEFFF')
      })

      jest.clearAllMocks()

      // Then change opacity
      await userEvent.clear(opacityInput as HTMLInputElement)
      await userEvent.type(opacityInput as HTMLInputElement, '50')
      fireEvent.blur(opacityInput as HTMLInputElement)

      await waitFor(() => {
        expect(mockOnColorChange).toHaveBeenCalledWith('#ABCDEF80') // 50% = 0x80
      })
    })

    it('does not call onColorChange when color is invalid', async () => {
      render(
        <ThemeWrapper>
          <ColorOpacityField
            color="#FF0000FF"
            onColorChange={mockOnColorChange}
            onEditClick={mockOnEditClick}
          />
        </ThemeWrapper>
      )

      const colorInput = screen
        .getByTestId('bgColorTextField')
        .querySelector('input')

      // Make color input invalid
      await userEvent.clear(colorInput as HTMLInputElement)
      await userEvent.type(colorInput as HTMLInputElement, 'invalid')
      fireEvent.blur(colorInput as HTMLInputElement)

      await waitFor(() => {
        expect(colorInput).toHaveValue('#FF0000')
        expect(mockOnColorChange).not.toHaveBeenCalled()
      })
    })
  })

  describe('Edit Button Functionality', () => {
    it('calls onEditClick when edit icon is clicked', async () => {
      render(
        <ThemeWrapper>
          <ColorOpacityField
            color="#FF0000"
            onColorChange={mockOnColorChange}
            onEditClick={mockOnEditClick}
          />
        </ThemeWrapper>
      )

      const editIcon = screen.getByTestId('Edit2Icon')
      fireEvent.click(editIcon)

      expect(mockOnEditClick).toHaveBeenCalledTimes(1)
    })

    it('displays edit icon with pointer cursor', () => {
      render(
        <ThemeWrapper>
          <ColorOpacityField
            color="#FF0000"
            onColorChange={mockOnColorChange}
            onEditClick={mockOnEditClick}
          />
        </ThemeWrapper>
      )

      const editIcon = screen.getByTestId('Edit2Icon')
      expect(editIcon).toHaveStyle('cursor: pointer')
    })
  })

  describe('Props Reinitialize', () => {
    it('updates fields when color prop changes', () => {
      const { rerender } = render(
        <ThemeWrapper>
          <ColorOpacityField
            color="#FF0000FF"
            onColorChange={mockOnColorChange}
            onEditClick={mockOnEditClick}
          />
        </ThemeWrapper>
      )

      const colorInput = screen
        .getByTestId('bgColorTextField')
        .querySelector('input')
      const opacityInput = screen
        .getByTestId('bgOpacityTextField')
        .querySelector('input')

      expect(colorInput).toHaveValue('#FF0000')
      expect(opacityInput).toHaveValue('100')

      // Update props
      rerender(
        <ThemeWrapper>
          <ColorOpacityField
            color="#00FF0080"
            onColorChange={mockOnColorChange}
            onEditClick={mockOnEditClick}
          />
        </ThemeWrapper>
      )

      expect(colorInput).toHaveValue('#00FF00')
      expect(opacityInput).toHaveValue('50')
    })
  })

  describe('Input Constraints', () => {
    it('limits color input to 9 characters', () => {
      render(
        <ThemeWrapper>
          <ColorOpacityField
            color="#FF0000"
            onColorChange={mockOnColorChange}
            onEditClick={mockOnEditClick}
          />
        </ThemeWrapper>
      )

      const colorInput = screen
        .getByTestId('bgColorTextField')
        .querySelector('input')
      expect(colorInput).toHaveAttribute('maxLength', '9')
    })

    it('limits opacity input to 3 characters', () => {
      render(
        <ThemeWrapper>
          <ColorOpacityField
            color="#FF0000"
            onColorChange={mockOnColorChange}
            onEditClick={mockOnEditClick}
          />
        </ThemeWrapper>
      )

      const opacityInput = screen
        .getByTestId('bgOpacityTextField')
        .querySelector('input')
      expect(opacityInput).toHaveAttribute('maxLength', '3')
    })
  })

  describe('Accessibility', () => {
    it('has proper test ids for both input fields', () => {
      render(
        <ThemeWrapper>
          <ColorOpacityField
            color="#FF0000"
            onColorChange={mockOnColorChange}
            onEditClick={mockOnEditClick}
          />
        </ThemeWrapper>
      )

      expect(screen.getByTestId('bgColorTextField')).toBeInTheDocument()
      expect(screen.getByTestId('bgOpacityTextField')).toBeInTheDocument()
    })

    it('accepts custom data-testid prop', () => {
      render(
        <ThemeWrapper>
          <ColorOpacityField
            color="#FF0000"
            onColorChange={mockOnColorChange}
            onEditClick={mockOnEditClick}
            data-testid="custom-color-opacity-field"
          />
        </ThemeWrapper>
      )

      // The component doesn't currently use the data-testid prop on the root element,
      // but we can test that it's accepted without errors
      expect(screen.getByTestId('bgColorTextField')).toBeInTheDocument()
    })
  })
})
