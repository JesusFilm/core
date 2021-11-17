import { render } from '@testing-library/react'
import { Canvas } from '.'

describe('TestComponent', () => {
  it('should render the element', () => {
    const { getByText } = render(<Canvas />)
    expect(getByText('Canvas')).toBeInTheDocument()
  })
})
