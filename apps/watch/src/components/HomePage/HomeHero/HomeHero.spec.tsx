import { render } from '@testing-library/react'

import { HomeHero } from '.'

describe('HomeHero', () => {
  it('should render HomeHero', () => {
    const { getByRole } = render(<HomeHero />)
    expect(getByRole('img')).toHaveAttribute('src', 'jesus.jpg')
  })
})
