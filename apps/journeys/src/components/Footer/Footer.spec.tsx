import { render } from '@testing-library/react'
import { Footer } from './Footer'

describe('Footer', () => {
  it('should render the terms and conditions and privacy policy links', () => {
    const { getByText } = render(<Footer />)
    expect(getByText('Terms')).toBeInTheDocument()
    expect(getByText('Privacy')).toBeInTheDocument()
  })
})
