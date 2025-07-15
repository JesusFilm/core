import { render, screen } from '@testing-library/react'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { Swatch } from './Swatch'

// Helper function to render with theme provider
const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.light}>
      {ui}
    </ThemeProvider>
  )
}

describe('Swatch', () => {
  const defaultProps = {
    id: 'test-color',
    color: '#FF0000'
  }

  describe('Basic Rendering', () => {
    it('renders with required props', () => {
      renderWithTheme(<Swatch {...defaultProps} />)

      const swatch = screen.getByTestId('Swatch-test-color')
      expect(swatch).toBeInTheDocument()
    })

    it('displays the correct background color', () => {
      renderWithTheme(<Swatch {...defaultProps} />)

      const swatch = screen.getByTestId('Swatch-test-color')
      expect(swatch).toHaveStyle({ backgroundColor: '#FF0000' })
    })

    it('has correct test id based on id prop', () => {
      renderWithTheme(<Swatch id="custom-id" color="#00FF00" />)

      expect(screen.getByTestId('Swatch-custom-id')).toBeInTheDocument()
    })

    it('has correct id attribute', () => {
      renderWithTheme(<Swatch {...defaultProps} />)

      const swatch = screen.getByTestId('Swatch-test-color')
      expect(swatch).toHaveAttribute('id', 'test-color')
    })
  })

  describe('Variant Prop - Square (Default)', () => {
    it('renders with square variant by default', () => {
      renderWithTheme(<Swatch {...defaultProps} />)

      const swatch = screen.getByTestId('Swatch-test-color')
      expect(swatch).toBeInTheDocument()
      expect(swatch).toHaveStyle({ backgroundColor: '#FF0000' })
    })

    it('renders with square variant when explicitly set', () => {
      renderWithTheme(<Swatch {...defaultProps} variant="square" />)

      const swatch = screen.getByTestId('Swatch-test-color')
      expect(swatch).toBeInTheDocument()
      expect(swatch).toHaveStyle({ backgroundColor: '#FF0000' })
    })
  })

  describe('Variant Prop - Rounded', () => {
    it('renders with rounded variant', () => {
      renderWithTheme(<Swatch {...defaultProps} variant="rounded" />)

      const swatch = screen.getByTestId('Swatch-test-color')
      expect(swatch).toBeInTheDocument()
      expect(swatch).toHaveStyle({ backgroundColor: '#FF0000' })
    })
  })

  describe('Color Prop', () => {
    it('handles hex colors with hash', () => {
      renderWithTheme(<Swatch id="hex-color" color="#123456" />)

      const swatch = screen.getByTestId('Swatch-hex-color')
      expect(swatch).toHaveStyle({ backgroundColor: '#123456' })
    })

    it('handles hex colors without hash', () => {
      renderWithTheme(<Swatch id="hex-no-hash" color="ABCDEF" />)

      const swatch = screen.getByTestId('Swatch-hex-no-hash')
      expect(swatch).toHaveStyle({ backgroundColor: 'ABCDEF' })
    })

    it('handles 8-digit hex colors with alpha', () => {
      renderWithTheme(<Swatch id="hex-alpha" color="#FF000080" />)

      const swatch = screen.getByTestId('Swatch-hex-alpha')
      expect(swatch).toHaveStyle({ backgroundColor: '#FF000080' })
    })

    it('handles RGB colors', () => {
      renderWithTheme(<Swatch id="rgb-color" color="rgb(255, 0, 0)" />)

      const swatch = screen.getByTestId('Swatch-rgb-color')
      expect(swatch).toHaveStyle({ backgroundColor: 'rgb(255, 0, 0)' })
    })

    it('handles RGBA colors', () => {
      renderWithTheme(<Swatch id="rgba-color" color="rgba(0, 255, 0, 0.5)" />)

      const swatch = screen.getByTestId('Swatch-rgba-color')
      expect(swatch).toHaveStyle({ backgroundColor: 'rgba(0, 255, 0, 0.5)' })
    })

    it('handles HSL colors', () => {
      renderWithTheme(<Swatch id="hsl-color" color="hsl(240, 100%, 50%)" />)

      const swatch = screen.getByTestId('Swatch-hsl-color')
      expect(swatch).toHaveStyle({ backgroundColor: 'hsl(240, 100%, 50%)' })
    })

    it('handles named colors', () => {
      renderWithTheme(<Swatch id="named-color" color="red" />)

      const swatch = screen.getByTestId('Swatch-named-color')
      expect(swatch).toHaveStyle({ backgroundColor: 'red' })
    })

    it('handles transparent color', () => {
      renderWithTheme(<Swatch id="transparent" color="transparent" />)

      const swatch = screen.getByTestId('Swatch-transparent')
      expect(swatch).toHaveStyle({ backgroundColor: 'transparent' })
    })
  })

  describe('Border Styling', () => {
    it('has consistent border styling', () => {
      renderWithTheme(<Swatch {...defaultProps} />)

      const swatch = screen.getByTestId('Swatch-test-color')
      expect(swatch).toHaveStyle({
        border: '1px solid rgba(0, 0, 0, 0.2)'
      })
    })

    it('maintains border styling across variants', () => {
      const { rerender } = renderWithTheme(
        <Swatch {...defaultProps} variant="square" />
      )

      let swatch = screen.getByTestId('Swatch-test-color')
      expect(swatch).toHaveStyle({
        border: '1px solid rgba(0, 0, 0, 0.2)'
      })

      rerender(
        <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.light}>
          <Swatch {...defaultProps} variant="rounded" />
        </ThemeProvider>
      )

      swatch = screen.getByTestId('Swatch-test-color')
      expect(swatch).toHaveStyle({
        border: '1px solid rgba(0, 0, 0, 0.2)'
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper test id format', () => {
      renderWithTheme(<Swatch id="accessibility-test" color="#000000" />)

      expect(
        screen.getByTestId('Swatch-accessibility-test')
      ).toBeInTheDocument()
    })

    it('maintains id attribute for potential form associations', () => {
      renderWithTheme(<Swatch id="form-color" color="#FFFFFF" />)

      const swatch = screen.getByTestId('Swatch-form-color')
      expect(swatch).toHaveAttribute('id', 'form-color')
    })

    it('has proper ARIA attributes', () => {
      renderWithTheme(<Swatch id="aria-test" color="#FF0000" />)

      const swatch = screen.getByTestId('Swatch-aria-test')
      expect(swatch).toBeInTheDocument()
      expect(swatch.tagName).toBe('DIV')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty id gracefully', () => {
      renderWithTheme(<Swatch id="" color="#FF0000" />)

      expect(screen.getByTestId('Swatch-')).toBeInTheDocument()
    })

    it('handles empty color gracefully', () => {
      renderWithTheme(<Swatch id="empty-color" color="" />)

      const swatch = screen.getByTestId('Swatch-empty-color')
      expect(swatch).toHaveStyle({ backgroundColor: '' })
    })

    it('handles special characters in id', () => {
      const specialId = 'color-with-#-and-@-symbols'
      renderWithTheme(<Swatch id={specialId} color="#FF0000" />)

      expect(screen.getByTestId(`Swatch-${specialId}`)).toBeInTheDocument()
    })

    it('handles very long color values', () => {
      const longColor = 'rgba(255, 255, 255, 0.123456789)'
      renderWithTheme(<Swatch id="long-color" color={longColor} />)

      const swatch = screen.getByTestId('Swatch-long-color')
      expect(swatch).toHaveStyle({ backgroundColor: longColor })
    })

    it('handles invalid color values', () => {
      renderWithTheme(<Swatch id="invalid-color" color="not-a-color" />)

      const swatch = screen.getByTestId('Swatch-invalid-color')
      expect(swatch).toHaveStyle({ backgroundColor: 'not-a-color' })
    })
  })

  describe('Component Structure', () => {
    it('renders as a Material-UI Box component', () => {
      const { container } = renderWithTheme(<Swatch {...defaultProps} />)

      const box = container.querySelector('.MuiBox-root')
      expect(box).toBeInTheDocument()
    })

    it('applies background color correctly', () => {
      renderWithTheme(<Swatch {...defaultProps} />)

      const swatch = screen.getByTestId('Swatch-test-color')
      expect(swatch).toHaveStyle({
        backgroundColor: '#FF0000'
      })
    })

    it('applies border styling correctly', () => {
      renderWithTheme(<Swatch {...defaultProps} />)

      const swatch = screen.getByTestId('Swatch-test-color')
      expect(swatch).toHaveStyle({
        border: '1px solid rgba(0, 0, 0, 0.2)'
      })
    })
  })

  describe('Prop Updates', () => {
    it('updates color when color prop changes', () => {
      const { rerender } = renderWithTheme(<Swatch {...defaultProps} />)

      let swatch = screen.getByTestId('Swatch-test-color')
      expect(swatch).toHaveStyle({ backgroundColor: '#FF0000' })

      rerender(
        <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.light}>
          <Swatch {...defaultProps} color="#00FF00" />
        </ThemeProvider>
      )

      swatch = screen.getByTestId('Swatch-test-color')
      expect(swatch).toHaveStyle({ backgroundColor: '#00FF00' })
    })

    it('renders different variants correctly', () => {
      const { rerender } = renderWithTheme(
        <Swatch {...defaultProps} variant="square" />
      )

      let swatch = screen.getByTestId('Swatch-test-color')
      expect(swatch).toBeInTheDocument()
      expect(swatch).toHaveStyle({ backgroundColor: '#FF0000' })

      rerender(
        <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.light}>
          <Swatch {...defaultProps} variant="rounded" />
        </ThemeProvider>
      )

      swatch = screen.getByTestId('Swatch-test-color')
      expect(swatch).toBeInTheDocument()
      expect(swatch).toHaveStyle({ backgroundColor: '#FF0000' })
    })

    it('updates test id and id when id prop changes', () => {
      const { rerender } = renderWithTheme(<Swatch {...defaultProps} />)

      expect(screen.getByTestId('Swatch-test-color')).toBeInTheDocument()
      expect(screen.getByTestId('Swatch-test-color')).toHaveAttribute(
        'id',
        'test-color'
      )

      rerender(
        <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.light}>
          <Swatch {...defaultProps} id="new-id" />
        </ThemeProvider>
      )

      expect(screen.queryByTestId('Swatch-test-color')).not.toBeInTheDocument()
      expect(screen.getByTestId('Swatch-new-id')).toBeInTheDocument()
      expect(screen.getByTestId('Swatch-new-id')).toHaveAttribute(
        'id',
        'new-id'
      )
    })
  })

  describe('Common Color Combinations', () => {
    const commonColors = [
      { name: 'white', color: '#FFFFFF' },
      { name: 'black', color: '#000000' },
      { name: 'red', color: '#FF0000' },
      { name: 'green', color: '#00FF00' },
      { name: 'blue', color: '#0000FF' },
      { name: 'yellow', color: '#FFFF00' },
      { name: 'cyan', color: '#00FFFF' },
      { name: 'magenta', color: '#FF00FF' }
    ]

    commonColors.forEach(({ name, color }) => {
      it(`renders ${name} color correctly`, () => {
        renderWithTheme(<Swatch id={name} color={color} />)

        const swatch = screen.getByTestId(`Swatch-${name}`)
        expect(swatch).toHaveStyle({ backgroundColor: color })
      })
    })
  })

  describe('Variant Behavior', () => {
    it('accepts square variant prop', () => {
      renderWithTheme(<Swatch {...defaultProps} variant="square" />)

      const swatch = screen.getByTestId('Swatch-test-color')
      expect(swatch).toBeInTheDocument()
    })

    it('accepts rounded variant prop', () => {
      renderWithTheme(<Swatch {...defaultProps} variant="rounded" />)

      const swatch = screen.getByTestId('Swatch-test-color')
      expect(swatch).toBeInTheDocument()
    })

    it('defaults to square variant when no variant specified', () => {
      renderWithTheme(<Swatch {...defaultProps} />)

      const swatch = screen.getByTestId('Swatch-test-color')
      expect(swatch).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('works with different theme modes', () => {
      const { rerender } = render(
        <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.light}>
          <Swatch {...defaultProps} />
        </ThemeProvider>
      )

      let swatch = screen.getByTestId('Swatch-test-color')
      expect(swatch).toBeInTheDocument()

      rerender(
        <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.dark}>
          <Swatch {...defaultProps} />
        </ThemeProvider>
      )

      swatch = screen.getByTestId('Swatch-test-color')
      expect(swatch).toBeInTheDocument()
    })

    it('maintains functionality across re-renders', () => {
      const { rerender } = renderWithTheme(<Swatch {...defaultProps} />)

      expect(screen.getByTestId('Swatch-test-color')).toBeInTheDocument()

      rerender(
        <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.light}>
          <Swatch {...defaultProps} color="#00FF00" />
        </ThemeProvider>
      )

      const swatch = screen.getByTestId('Swatch-test-color')
      expect(swatch).toHaveStyle({ backgroundColor: '#00FF00' })
    })
  })
})
