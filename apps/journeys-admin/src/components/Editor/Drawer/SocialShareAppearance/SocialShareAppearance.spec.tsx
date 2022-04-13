import { render } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { SocialShareAppearance } from '.'

describe('SocialShareAppearance', () => {
  it('should render SocialShareAppearance', () => {
    const { getByText, getByTestId } = render(
      <MockedProvider>
        <SocialShareAppearance />
      </MockedProvider>
    )
    expect(getByText('Social Image')).toBeInTheDocument()
    expect(getByTestId('social-image-edit')).toBeInTheDocument()
    expect(getByTestId('seo-title-form')).toBeInTheDocument()
    expect(getByTestId('seo-description-form')).toBeInTheDocument()
  })
})
