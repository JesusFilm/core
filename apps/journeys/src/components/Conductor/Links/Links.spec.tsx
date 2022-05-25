import { render } from '@testing-library/react'
import { Links } from './Links'

describe('Links', () => {
  it('should render the terms and conditions and privacy policy links', () => {
    const { getByText } = render(<Links />)
    expect(getByText('Terms')).toBeInTheDocument()
    expect(getByText('Privacy')).toBeInTheDocument()
  })
})
