import { render } from '@testing-library/react'
import CardOverview from './CardOverview'

describe('CardOverview', () => {
  it('should render button with the correct link', () => {
    const { getByRole } = render(<CardOverview slug={'my-journey'} />)
    expect(getByRole('link')).toBeInTheDocument()
    expect(getByRole('link')).toHaveAttribute(
      'href',
      '/journeys/my-journey/edit'
    )
  })
})
