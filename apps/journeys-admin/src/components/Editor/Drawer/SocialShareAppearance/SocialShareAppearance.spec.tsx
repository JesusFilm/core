import { render } from '@testing-library/react'
import { SocialShareAppearance } from '.'

describe('SocialShareAppearance', () => {
  it('should render SocialShareAppearance', () => {
    const { getByText } = render(<SocialShareAppearance id="journeyId" />)
    expect(getByText('Social Image')).toBeInTheDocument()
  })
})
