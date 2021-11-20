import { render } from '@testing-library/react'
import TestComponent from './Test'

describe('TestComponent', () => {
  it('should render the element', () => {
    const { getAllByText } = render(<TestComponent />)
    expect(getAllByText('Test Component')[0]).toBeInTheDocument()
  })
})
