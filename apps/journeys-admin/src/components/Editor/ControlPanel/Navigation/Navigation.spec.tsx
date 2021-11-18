import { render } from '@testing-library/react'
import { Navigation } from '.'

describe('Navigation', () => {
  it('should render the element', () => {
    const { getByText } = render(<Navigation />)
    expect(getByText('Navigation')).toBeInTheDocument()
  })
})
