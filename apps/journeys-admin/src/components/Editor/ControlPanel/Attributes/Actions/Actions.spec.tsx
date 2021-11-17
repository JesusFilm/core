import { render } from '@testing-library/react'
import { Actions } from '.'

describe('Actions', () => {
  it('should render the element', () => {
    const { getByText } = render(<Actions />)
    expect(getByText('Actions')).toBeInTheDocument()
  })
})
