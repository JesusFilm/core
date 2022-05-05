import { render, fireEvent } from '@testing-library/react'

import { PaletteColorPicker } from './PaletteColorPicker'

describe('PaletteColorPicker', () => {
  const onChange = jest.fn()

  const darkPalette = {
    one: '#C62828',
    two: '#30313D'
  }

  const lightPalette = {
    one: '#FFCDD2',
    two: '#FEFEFE'
  }

  it('displays the palette for dark mode', () => {
    const { getByTestId } = render(
      <PaletteColorPicker
        selectedColor="#C62828"
        colors={darkPalette}
        onChange={onChange}
      />
    )

    expect(getByTestId('#C62828')).toBeInTheDocument()
    expect(getByTestId('#30313D')).toBeInTheDocument()
  })

  it('displays the palette for light mode', () => {
    const { getByTestId } = render(
      <PaletteColorPicker
        selectedColor="#FEFEFE"
        colors={lightPalette}
        onChange={onChange}
      />
    )

    expect(getByTestId('#FFCDD2')).toBeInTheDocument()
    expect(getByTestId('#FEFEFE')).toBeInTheDocument()
  })

  it('calls onChange on swatch click', () => {
    const { getByTestId } = render(
      <PaletteColorPicker
        selectedColor="#C62828"
        colors={darkPalette}
        onChange={onChange}
      />
    )

    fireEvent.click(getByTestId('#30313D'))

    expect(onChange).toHaveBeenCalledWith('#30313D')
  })
})
