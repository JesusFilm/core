import { render } from '@testing-library/react'

import { Swatch } from './Swatch'

describe('Swatch', () => {
  it('displays the color', () => {
    const { getByTestId } = render(<Swatch id="id" color="#FFFFFF" />)

    expect(getByTestId('Swatch-id')).toHaveStyle({ backgroundColor: '#FFFFFF' })
  })
})
