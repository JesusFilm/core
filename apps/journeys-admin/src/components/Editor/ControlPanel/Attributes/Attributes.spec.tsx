import { render } from '@testing-library/react'
import { Attributes } from '.'

describe('Attributes', () => {
  it('should render the element', () => {
    const { getByText } = render(<Attributes />)
    expect(getByText('Attributes')).toBeInTheDocument()
  })
})
