import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { JourneyProvider } from '@core/journeys/ui'
import { JourneyStatus } from '../../../../../__generated__/globalTypes'
import { GetJourney_journey as Journey } from '../../../../../__generated__/GetJourney'
import { SocialShareAppearance } from '.'

describe('SocialShareAppearance', () => {
  const slug = 'untitiled-journey'
  it('should render SocialShareAppearance', () => {
    const { getByText, getByTestId, getByRole } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: { status: JourneyStatus.published } as unknown as Journey,
            admin: true
          }}
        >
          <SocialShareAppearance />
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByText('Social Image')).toBeInTheDocument()
    expect(getByTestId('social-image-edit')).toBeInTheDocument()
    expect(getByRole('textbox', { name: 'Title' })).toBeInTheDocument()
    expect(getByRole('textbox', { name: 'Description' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Facebook' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Twitter' })).toBeInTheDocument()
  })

  it('should open facebook share in new window', () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=https://your.nextstep.is/${slug}`

    const { getByRole } = render(
      <MockedProvider>
        <JourneyProvider
          value={{ journey: { slug } as unknown as Journey, admin: true }}
        >
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
    const twitterUrl = `https://twitter.com/intent/tweet?url=https://your.nextstep.is/${slug}`

    const { getByRole } = render(
      <MockedProvider>
        <JourneyProvider
          value={{ journey: { slug } as unknown as Journey, admin: true }}
        >
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
        <JourneyProvider
          value={{
            journey: { publishedAt: null } as unknown as Journey,
            admin: true
          }}
        >
          <SocialShareAppearance />
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Facebook' })).toBeDisabled()
    expect(getByRole('button', { name: 'Twitter' })).toBeDisabled()

    fireEvent.focusIn(getByRole('button', { name: 'Facebook' }))
    await waitFor(() =>
      expect(
        getByText('Only published journeys are shareable')
      ).toBeInTheDocument()
    )

    fireEvent.focusIn(getByRole('button', { name: 'Twitter' }))
    await waitFor(() =>
      expect(
        getByText('Only published journeys are shareable')
      ).toBeInTheDocument()
    )
  })
})
