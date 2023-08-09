import { render } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { publishedJourney } from '../data'

import { SocialImage } from './SocialImage'

describe('SocialImage', () => {
  it('renders the primary image of a journey', () => {
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
              blurhash: ''
            }
          },
          variant: 'admin'
        }}
      >
        <SocialImage />
      </JourneyProvider>
    )
    expect(getByRole('img')).toHaveAttribute(
      'alt',
      'random image from unsplash'
    )
    expect(getByRole('img')).toHaveAttribute(
      'src',
      'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920'
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
        <SocialImage />
      </JourneyProvider>
    )
    expect(getByTestId('ImageIcon')).toBeInTheDocument()
  })
})
