import { render } from '@testing-library/react'
import { Footer } from './Footer'

describe('Footer', () => {
  it('should have Terms of use link', () => {
    const { getAllByText } = render(<Footer />)
    expect(getAllByText('Terms of use')).toHaveLength(2)
  })
  it('should have Legal Statement link', () => {
    const { getAllByText } = render(<Footer />)
    expect(getAllByText('Legal Statement')).toHaveLength(2)
  })
})
