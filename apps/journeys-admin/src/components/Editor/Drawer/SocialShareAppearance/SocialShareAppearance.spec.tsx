import { render, fireEvent } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { JourneyProvider } from '../../../../libs/context'
import { GetJourney_journey as Journey } from '../../../../../__generated__/GetJourney'
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
    expect(getByTestId('facebook-share-button')).toBeInTheDocument()
    expect(getByTestId('twitter-share-button')).toBeInTheDocument()
  })

  it('should open facebook share in new window', () => {
    const closeSpy = jest.fn()
    window.open = jest.fn().mockReturnValue({ close: closeSpy })

    const slug = 'https://wwww.example.jpg'

    const { getByTestId } = render(
      <MockedProvider>
        <JourneyProvider value={{ slug } as unknown as Journey}>
          <SocialShareAppearance />
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(getByTestId('facebook-share-button'))

    expect(window.open).toHaveBeenCalledWith(
      `https://www.facebook.com/sharer/sharer.php?u=https://your.nextstep.is/${slug}`,
      '_blank'
    )
  })

  it('should open twitter share in new window', () => {
    const closeSpy = jest.fn()
    window.open = jest.fn().mockReturnValue({ close: closeSpy })

    const slug = 'https://wwww.example.jpg'
    const encodedUrl = encodeURIComponent(slug)

    const { getByTestId } = render(
      <MockedProvider>
        <JourneyProvider value={{ slug } as unknown as Journey}>
          <SocialShareAppearance />
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(getByTestId('twitter-share-button'))

    expect(window.open).toHaveBeenCalledWith(
      `https://twitter.com/intent/tweet?url=https://your.nextstep.is/${encodedUrl}`,
      '_blank'
    )
  })
})
