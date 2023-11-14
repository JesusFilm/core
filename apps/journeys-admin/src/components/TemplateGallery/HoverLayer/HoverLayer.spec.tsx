import { render } from '@testing-library/react'

import { HoverLayer } from './HoverLayer'

describe('HoverLayer', () => {
  it('should target opacity with theme transition values', () => {
    const { getByTestId } = render(<HoverLayer />)

    expect(getByTestId('hoverLayer')).toHaveStyle({
      transition: 'opacity 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms'
    })
  })
})
