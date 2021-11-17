import { render } from '@testing-library/react'
import { Editor } from '.'

describe('Editor', () => {
  it('should render the element', () => {
    const { getByText } = render(<Editor />)
    expect(getByText('Editor')).toBeInTheDocument()
  })
})
