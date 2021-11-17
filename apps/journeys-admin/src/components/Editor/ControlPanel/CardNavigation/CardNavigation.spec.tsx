import { render } from '@testing-library/react'
import { CardNavigation } from '.'

describe('CardNavigation', () => {
  it('should render the element', () => {
    const { getByText } = render(<CardNavigation />)
    expect(getByText('CardNavigation')).toBeInTheDocument()
  })
})
