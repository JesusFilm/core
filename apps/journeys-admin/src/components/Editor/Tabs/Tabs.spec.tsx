import { render } from '@testing-library/react'
import { Tabs } from '.'

describe('Tabs', () => {
  it('should render the element', () => {
    const { getByText } = render(<Tabs />)
    expect(getByText('Tabs')).toBeInTheDocument()
  })
})
