import { render } from '@testing-library/react'
import { TopBar } from '.'

describe('TopBar', () => {
  it('should render the element', () => {
    const { getByText } = render(<TopBar />)
    expect(getByText('TopBar')).toBeInTheDocument()
  })
})
