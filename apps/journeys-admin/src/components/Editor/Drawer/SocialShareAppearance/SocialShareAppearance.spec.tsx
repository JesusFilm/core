import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import useMediaQuery from '@mui/material/useMediaQuery'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { JourneyStatus } from '../../../../../__generated__/globalTypes'
import { GetJourney_journey as Journey } from '../../../../../__generated__/GetJourney'
import { SocialShareAppearance } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('SocialShareAppearance', () => {
  beforeEach(() => (useMediaQuery as jest.Mock).mockImplementation(() => true))

  const slug = 'untitiled-journey'
  const originalEnv = process.env

  it('should render SocialShareAppearance', () => {
    const { getByText, getByTestId, getByRole } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: { status: JourneyStatus.published } as unknown as Journey,
            admin: true
          }}
        >
          <FlagsProvider>
            <SocialShareAppearance />
          </FlagsProvider>
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

  it('should open facebook share in new window in development', () => {
    jest.resetModules()
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_JOURNEYS_URL: 'http://localhost:4100'
    }

    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${
      process.env.NEXT_PUBLIC_JOURNEYS_URL as string
    }/${slug}`

    const { getByRole } = render(
      <MockedProvider>
        <JourneyProvider
          value={{ journey: { slug } as unknown as Journey, admin: true }}
        >
          <FlagsProvider>
            <SocialShareAppearance />
          </FlagsProvider>
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

    process.env = originalEnv
  })

  it('should open facebook share in new window in production', () => {
    jest.resetModules()
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_JOURNEYS_URL: undefined
    }

    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=https://your.nextstep.is/${slug}`

    const { getByRole } = render(
      <MockedProvider>
        <JourneyProvider
          value={{ journey: { slug } as unknown as Journey, admin: true }}
        >
          <FlagsProvider>
            <SocialShareAppearance />
          </FlagsProvider>
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

    process.env = originalEnv
  })

  it('should open twitter share in new window in development', () => {
    jest.resetModules()
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_JOURNEYS_URL: 'http://localhost:4100'
    }

    const twitterUrl = `https://twitter.com/intent/tweet?url=${
      process.env.NEXT_PUBLIC_JOURNEYS_URL as string
    }/${slug}`

    const { getByRole } = render(
      <MockedProvider>
        <JourneyProvider
          value={{ journey: { slug } as unknown as Journey, admin: true }}
        >
          <FlagsProvider>
            <SocialShareAppearance />
          </FlagsProvider>
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

    process.env = originalEnv
  })

  it('should open twitter share in new window in production', () => {
    jest.resetModules()
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_JOURNEYS_URL: undefined
    }

    const twitterUrl = `https://twitter.com/intent/tweet?url=https://your.nextstep.is/${slug}`

    const { getByRole } = render(
      <MockedProvider>
        <JourneyProvider
          value={{ journey: { slug } as unknown as Journey, admin: true }}
        >
          <FlagsProvider>
            <SocialShareAppearance />
          </FlagsProvider>
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

    process.env = originalEnv
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
          <FlagsProvider>
            <SocialShareAppearance />
          </FlagsProvider>
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
