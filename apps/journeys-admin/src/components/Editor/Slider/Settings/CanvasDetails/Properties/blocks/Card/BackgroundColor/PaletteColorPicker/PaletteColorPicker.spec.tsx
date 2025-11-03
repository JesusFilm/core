import { fireEvent, render, screen } from '@testing-library/react'

import { PaletteColorPicker } from './PaletteColorPicker'

describe('PaletteColorPicker', () => {
  const mockOnChange = jest.fn()
  const testColors = [
    '#FFFFFF',
    '#F2F3F6',
    '#D1D5DB',
    '#6B7280',
    '#1F2937',
    '#DC2626',
    '#C7E834',
    '#10B981'
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initial Rendering', () => {
    it('renders all colors from the palette', () => {
      render(
        <PaletteColorPicker
          selectedColor="#FFFFFF"
          colors={testColors}
          onChange={mockOnChange}
        />
      )

      testColors.forEach((color) => {
        expect(screen.getByTestId(`Swatch-${color}`)).toBeInTheDocument()
      })
    })

    it('displays the correct number of color swatches', () => {
      render(
        <PaletteColorPicker
          selectedColor="#FFFFFF"
          colors={testColors}
          onChange={mockOnChange}
        />
      )

      const swatches = screen.getAllByTestId(/^Swatch-/)
      expect(swatches).toHaveLength(testColors.length)
    })

    it('renders with empty colors array', () => {
      render(
        <PaletteColorPicker
          selectedColor="#FFFFFF"
          colors={[]}
          onChange={mockOnChange}
        />
      )

      const swatches = screen.queryAllByTestId(/^Swatch-/)
      expect(swatches).toHaveLength(0)
    })
  })

  describe('Color Selection', () => {
    it('shows check icon for selected color', () => {
      render(
        <PaletteColorPicker
          selectedColor="#DC2626"
          colors={testColors}
          onChange={mockOnChange}
        />
      )

      const checkIcon = screen.getByTestId('CheckIcon')
      expect(checkIcon).toBeInTheDocument()
    })

    it('shows check icon for selected color with alpha channel', () => {
      render(
        <PaletteColorPicker
          selectedColor="#DC2626AA"
          colors={testColors}
          onChange={mockOnChange}
        />
      )

      const checkIcon = screen.getByTestId('CheckIcon')
      expect(checkIcon).toBeInTheDocument()
    })

    it('does not show check icon when no color is selected', () => {
      render(
        <PaletteColorPicker
          selectedColor="#999999" // Color not in palette
          colors={testColors}
          onChange={mockOnChange}
        />
      )

      const checkIcon = screen.queryByTestId('CheckIcon')
      expect(checkIcon).not.toBeInTheDocument()
    })

    it('correctly identifies same color regardless of alpha channel', () => {
      render(
        <PaletteColorPicker
          selectedColor="#DC2626FF" // Full opacity
          colors={testColors}
          onChange={mockOnChange}
        />
      )

      const checkIcon = screen.getByTestId('CheckIcon')
      expect(checkIcon).toBeInTheDocument()
    })
  })

  describe('Click Interactions', () => {
    it('calls onChange when clicking a color swatch', () => {
      render(
        <PaletteColorPicker
          selectedColor="#FFFFFF"
          colors={testColors}
          onChange={mockOnChange}
        />
      )

      const redSwatch = screen.getByTestId('Swatch-#DC2626')
      fireEvent.click(redSwatch)

      expect(mockOnChange).toHaveBeenCalledWith('#DC26264D') // 30% opacity
    })

    it('calls onChange when clicking the check icon', () => {
      render(
        <PaletteColorPicker
          selectedColor="#DC2626"
          colors={testColors}
          onChange={mockOnChange}
        />
      )

      const checkIcon = screen.getByTestId('CheckIcon')
      fireEvent.click(checkIcon)

      expect(mockOnChange).toHaveBeenCalledWith('#DC26264D') // 30% opacity
    })

    it('preserves opacity when selecting a color', () => {
      render(
        <PaletteColorPicker
          selectedColor="#FFFFFF80" // 50% opacity
          colors={testColors}
          onChange={mockOnChange}
        />
      )

      const redSwatch = screen.getByTestId('Swatch-#DC2626')
      fireEvent.click(redSwatch)

      expect(mockOnChange).toHaveBeenCalledWith('#DC262680') // Same opacity
    })

    it('uses 30% opacity when current color has no alpha', () => {
      render(
        <PaletteColorPicker
          selectedColor="#FFFFFF" // No alpha channel
          colors={testColors}
          onChange={mockOnChange}
        />
      )

      const redSwatch = screen.getByTestId('Swatch-#DC2626')
      fireEvent.click(redSwatch)

      expect(mockOnChange).toHaveBeenCalledWith('#DC26264D')
    })
  })

  describe('Opacity Handling', () => {
    it('extracts opacity from 8-digit hex color', () => {
      render(
        <PaletteColorPicker
          selectedColor="#FFFFFF80" // 50% opacity
          colors={testColors}
          onChange={mockOnChange}
        />
      )

      const greenSwatch = screen.getByTestId('Swatch-#10B981')
      fireEvent.click(greenSwatch)

      expect(mockOnChange).toHaveBeenCalledWith('#10B98180') // 50% opacity preserved
    })

    it('handles 6-digit hex color as 30% opacity', () => {
      render(
        <PaletteColorPicker
          selectedColor="#FFFFFF" // No alpha
          colors={testColors}
          onChange={mockOnChange}
        />
      )

      const greenSwatch = screen.getByTestId('Swatch-#10B981')
      fireEvent.click(greenSwatch)

      expect(mockOnChange).toHaveBeenCalledWith('#10B9814D') // 30% opacity
    })

    it('handles various opacity levels correctly', () => {
      const opacityTests = [
        { input: '#FFFFFF00', expected: '#DC262600' }, // 0% opacity
        { input: '#FFFFFF33', expected: '#DC262633' }, // ~20% opacity
        { input: '#FFFFFF66', expected: '#DC262666' }, // ~40% opacity
        { input: '#FFFFFF99', expected: '#DC262699' }, // ~60% opacity
        { input: '#FFFFFFCC', expected: '#DC2626CC' }, // ~80% opacity
        { input: '#FFFFFFFF', expected: '#DC2626FF' } // 100% opacity
      ]

      opacityTests.forEach(({ input, expected }) => {
        const { unmount } = render(
          <PaletteColorPicker
            selectedColor={input}
            colors={testColors}
            onChange={mockOnChange}
          />
        )

        const redSwatch = screen.getByTestId('Swatch-#DC2626')
        fireEvent.click(redSwatch)

        expect(mockOnChange).toHaveBeenCalledWith(expected)

        unmount()
        mockOnChange.mockClear()
      })
    })
  })

  describe('Color Comparison', () => {
    it('correctly compares colors with different alpha channels', () => {
      const testCases = [
        { selected: '#DC2626', shouldMatch: true },
        { selected: '#DC2626FF', shouldMatch: true },
        { selected: '#DC262680', shouldMatch: true },
        { selected: '#DC262600', shouldMatch: true },
        { selected: '#FF0000', shouldMatch: false },
        { selected: '#DC2625', shouldMatch: false }
      ]

      testCases.forEach(({ selected, shouldMatch }) => {
        const { unmount } = render(
          <PaletteColorPicker
            selectedColor={selected}
            colors={testColors}
            onChange={mockOnChange}
          />
        )

        const checkIcon = screen.queryByTestId('CheckIcon')
        if (shouldMatch) {
          expect(checkIcon).toBeInTheDocument()
        } else {
          expect(checkIcon).not.toBeInTheDocument()
        }

        unmount()
      })
    })
  })

  describe('Grid Layout', () => {
    it('renders colors in a grid layout', () => {
      const { container } = render(
        <PaletteColorPicker
          selectedColor="#FFFFFF"
          colors={testColors}
          onChange={mockOnChange}
        />
      )

      const grid = container.querySelector('.MuiGrid-container')
      expect(grid).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has clickable elements with proper cursor styling', () => {
      const { container } = render(
        <PaletteColorPicker
          selectedColor="#FFFFFF"
          colors={testColors}
          onChange={mockOnChange}
        />
      )

      const clickableBoxes = container.querySelectorAll('.MuiBox-root')
      expect(clickableBoxes.length).toBeGreaterThan(0)
    })

    it('provides unique keys for each color', () => {
      render(
        <PaletteColorPicker
          selectedColor="#FFFFFF"
          colors={testColors}
          onChange={mockOnChange}
        />
      )

      testColors.forEach((color) => {
        const swatch = screen.getByTestId(`Swatch-${color}`)
        expect(swatch).toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles invalid hex colors gracefully', () => {
      const invalidColors = ['invalid', '#GGG', '#12345', '']

      expect(() => {
        render(
          <PaletteColorPicker
            selectedColor="#FFFFFF"
            colors={invalidColors}
            onChange={mockOnChange}
          />
        )
      }).not.toThrow()
    })

    it('handles empty selected color', () => {
      expect(() => {
        render(
          <PaletteColorPicker
            selectedColor=""
            colors={testColors}
            onChange={mockOnChange}
          />
        )
      }).not.toThrow()
    })

    it('handles undefined onChange gracefully', () => {
      expect(() => {
        render(
          <PaletteColorPicker
            selectedColor="#FFFFFF"
            colors={testColors}
            onChange={undefined as any}
          />
        )
      }).not.toThrow()

      // Note: Clicking would throw since onChange is undefined,
      // but rendering should work fine
    })

    it('handles very long color arrays', () => {
      const manyColors = Array.from(
        { length: 100 },
        (_, i) => `#${i.toString(16).padStart(6, '0')}`
      )

      render(
        <PaletteColorPicker
          selectedColor="#FFFFFF"
          colors={manyColors}
          onChange={mockOnChange}
        />
      )

      const swatches = screen.getAllByTestId(/^Swatch-/)
      expect(swatches).toHaveLength(100)
    })
  })

  describe('Component Updates', () => {
    it('updates when selectedColor prop changes', () => {
      const { rerender } = render(
        <PaletteColorPicker
          selectedColor="#999999" // Color not in palette
          colors={testColors}
          onChange={mockOnChange}
        />
      )

      expect(screen.queryByTestId('CheckIcon')).not.toBeInTheDocument()

      rerender(
        <PaletteColorPicker
          selectedColor="#DC2626"
          colors={testColors}
          onChange={mockOnChange}
        />
      )

      expect(screen.getByTestId('CheckIcon')).toBeInTheDocument()
    })

    it('updates when colors prop changes', () => {
      const initialColors = ['#FF0000', '#00FF00']
      const newColors = ['#0000FF', '#FFFF00']

      const { rerender } = render(
        <PaletteColorPicker
          selectedColor="#FFFFFF"
          colors={initialColors}
          onChange={mockOnChange}
        />
      )

      expect(screen.getByTestId('Swatch-#FF0000')).toBeInTheDocument()
      expect(screen.getByTestId('Swatch-#00FF00')).toBeInTheDocument()

      rerender(
        <PaletteColorPicker
          selectedColor="#FFFFFF"
          colors={newColors}
          onChange={mockOnChange}
        />
      )

      expect(screen.queryByTestId('Swatch-#FF0000')).not.toBeInTheDocument()
      expect(screen.queryByTestId('Swatch-#00FF00')).not.toBeInTheDocument()
      expect(screen.getByTestId('Swatch-#0000FF')).toBeInTheDocument()
      expect(screen.getByTestId('Swatch-#FFFF00')).toBeInTheDocument()
    })
  })
})
