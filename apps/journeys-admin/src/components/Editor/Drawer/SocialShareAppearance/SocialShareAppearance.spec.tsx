import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { JourneyProvider } from '../../../../libs/context'
import { GetJourney_journey as Journey } from '../../../../../__generated__/GetJourney'
import { SocialShareAppearance } from '.'

describe('SocialShareAppearance', () => {
  const slug = 'https://wwww.example.jpg'
  const encodedUrl = encodeURIComponent(slug)
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
    expect(getByTestId('facebook-share-button')).toBeInTheDocument()
    expect(getByTestId('twitter-share-button')).toBeInTheDocument()
  })

  it('should open facebook share in new window', () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=https://your.nextstep.is/${encodedUrl}`

    const { getByRole } = render(
      <MockedProvider>
        <JourneyProvider value={{ slug } as unknown as Journey}>
          <SocialShareAppearance />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(getByRole('link', { name: 'Facebook' })).toHaveAttribute(
      'href',
      facebookUrl
    )
    expect(getByRole('link', { name: 'Facebook' })).toHaveAttribute(
      'target',
      '_blank'
    )
  })

  it('should open twitter share in new window', () => {
    const twitterUrl = `https://twitter.com/intent/tweet?url=https://your.nextstep.is/${encodedUrl}`

    const { getByRole } = render(
      <MockedProvider>
        <JourneyProvider value={{ slug } as unknown as Journey}>
          <SocialShareAppearance />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(getByRole('link', { name: 'Twitter' })).toHaveAttribute(
      'href',
      twitterUrl
    )
    expect(getByRole('link', { name: 'Twitter' })).toHaveAttribute(
      'target',
      '_blank'
    )
  })

  it('should disable share buttons  and show tool tip if journey is not published', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider>
        <JourneyProvider value={{ publishedAt: null } as unknown as Journey}>
          <SocialShareAppearance />
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByRole('link', { name: 'Facebook' })).toHaveAttribute(
      'aria-disabled',
      'true'
    )
    expect(getByRole('link', { name: 'Twitter' })).toHaveAttribute(
      'aria-disabled',
      'true'
    )

    fireEvent.focusIn(getByRole('link', { name: 'Facebook' }))
    await waitFor(() =>
      expect(
        getByText('Only published journeys are shareable')
      ).toBeInTheDocument()
    )

    fireEvent.focusIn(getByRole('link', { name: 'Twitter' }))
    await waitFor(() =>
      expect(
        getByText('Only published journeys are shareable')
      ).toBeInTheDocument()
    )
  })
})
