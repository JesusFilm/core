import { render, waitFor } from '@testing-library/react'

import { SocialScreenSocialImage } from './SocialScreenSocialImage'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { publishedJourney } from '@core/journeys/ui/TemplateView/data'

describe('SocialScreenSocialImage', () => {
  it('renders the primary image of a journey', async () => {
    const { getByRole } = render(
      <JourneyProvider
        value={{
          journey: {
            ...publishedJourney,
            primaryImageBlock: {
              id: 'image1.id',
              __typename: 'ImageBlock',
              parentBlockId: null,
              parentOrder: 0,
              src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
              alt: 'random image from unsplash',
              width: 1920,
              height: 1080,
              blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
              scale: null,
              focalLeft: 50,
              focalTop: 50
            }
          },
          variant: 'admin'
        }}
      >
        <SocialScreenSocialImage />
      </JourneyProvider>
    )
    expect(getByRole('img')).toHaveAttribute(
      'alt',
      'random image from unsplash'
    )
    await waitFor(() =>
      expect(getByRole('img')).toHaveAttribute(
        'src',
        expect.stringMatching(
          /\/_next\/image\?url=https%3A%2F%2Fimages\.unsplash\.com%2Fphoto-1508363778367-af363f107cbb.*?/
        )
      )
    )
  })

  it('should display placeholder icon when no image set', () => {
    const { getByTestId } = render(
      <JourneyProvider
        value={{
          journey: publishedJourney,
          variant: 'admin'
        }}
      >
        <SocialScreenSocialImage />
      </JourneyProvider>
    )
    expect(getByTestId('GridEmptyIcon')).toBeInTheDocument()
  })

  it('should display skeleton when loading', () => {
    const { getByTestId } = render(
      <JourneyProvider value={{}}>
        <SocialScreenSocialImage />
      </JourneyProvider>
    )
    expect(getByTestId('SocialScreenSocialImageSkeleton')).toBeInTheDocument()
  })
})
