import { fireEvent, render } from '@testing-library/react'

import { PaletteColorPicker } from './PaletteColorPicker'

describe('PaletteColorPicker', () => {
  const onChange = jest.fn()

  const palette = [
    { dark: '#C62828', light: '#FFCDD2' },
    { dark: '#30313D', light: '#FEFEFE' }
  ]

  it('displays the palette for dark mode', () => {
    const { getByTestId } = render(
      <PaletteColorPicker
        selectedColor="#C62828"
        colors={palette}
        mode="dark"
        onChange={onChange}
      />
    )

    expect(getByTestId('Swatch-#C62828')).toBeInTheDocument()
    expect(getByTestId('Swatch-#30313D')).toBeInTheDocument()
  })

  it('displays the palette for light mode', () => {
    const { getByTestId } = render(
      <PaletteColorPicker
        selectedColor="#FEFEFE"
        colors={palette}
        mode="light"
        onChange={onChange}
      />
    )

    expect(getByTestId('Swatch-#FFCDD2')).toBeInTheDocument()
    expect(getByTestId('Swatch-#FEFEFE')).toBeInTheDocument()
  })

  it('calls onChange on swatch click', () => {
    const { getByTestId } = render(
      <PaletteColorPicker
        selectedColor="#C62828"
        colors={palette}
        mode="dark"
        onChange={onChange}
      />
    )

    fireEvent.click(getByTestId('Swatch-#30313D'))

    expect(onChange).toHaveBeenCalledWith('#30313D')
  })
})
