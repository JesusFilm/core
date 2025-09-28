import { render, screen, fireEvent } from '@testing-library/react'
import { journey } from '@core/journeys/ui/JourneyProvider/JourneyProvider.mock'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { ShareDrawer } from './ShareDrawer'
import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../__generated__/BlockFields'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('ShareDrawer', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders when open is true', () => {
    render(
      <JourneyProvider value={{ journey, variant: 'admin' }}>
        <ShareDrawer open={true} onClose={mockOnClose} />
      </JourneyProvider>
    )

    expect(screen.getByText('Share!')).toBeInTheDocument()
    expect(screen.getByLabelText('close-share-drawer')).toBeInTheDocument()
  })

  it('does not render when open is false', () => {
    render(
      <JourneyProvider value={{ journey, variant: 'admin' }}>
        <ShareDrawer open={false} onClose={mockOnClose} />
      </JourneyProvider>
    )

    expect(screen.queryByText('Share!')).not.toBeInTheDocument()
  })

  it('displays journey title when available', () => {
    const journeyWithTitle = {
      ...journey,
      seoTitle: 'Test Journey Title'
    }

    render(
      <JourneyProvider value={{ journey: journeyWithTitle, variant: 'admin' }}>
        <ShareDrawer open={true} onClose={mockOnClose} />
      </JourneyProvider>
    )

    expect(screen.getByText('Test Journey Title')).toBeInTheDocument()
  })

  it('displays display title when seoTitle is not available', () => {
    const journeyWithTitle = {
      ...journey,
      seoTitle: null,
      title: 'Display Title'
    }

    render(
      <JourneyProvider value={{ journey: journeyWithTitle, variant: 'admin' }}>
        <ShareDrawer open={true} onClose={mockOnClose} />
      </JourneyProvider>
    )

    expect(screen.getByText('Display Title')).toBeInTheDocument()
  })

  it('displays journey description when available', () => {
    const journeyWithDescription = {
      ...journey,
      seoDescription: 'This is a test journey description'
    }

    render(
      <JourneyProvider
        value={{ journey: journeyWithDescription, variant: 'admin' }}
      >
        <ShareDrawer open={true} onClose={mockOnClose} />
      </JourneyProvider>
    )

    expect(
      screen.getByText('This is a test journey description')
    ).toBeInTheDocument()
  })

  it('displays journey image when primary image is available', () => {
    const journeyWithImage = {
      ...journey,
      primaryImageBlock: {
        __typename: 'ImageBlock' as const,
        id: 'image-block-id',
        src: 'https://example.com/test-image.jpg',
        alt: 'Test Image Alt',
        width: 300,
        height: 200,
        parentBlockId: null,
        parentOrder: 0,
        blurhash: 'test-blurhash',
        scale: 1,
        focalTop: null,
        focalLeft: null
      } satisfies ImageBlock,
      seoTitle: 'Test Journey Title'
    }

    render(
      <JourneyProvider value={{ journey: journeyWithImage, variant: 'admin' }}>
        <ShareDrawer open={true} onClose={mockOnClose} />
      </JourneyProvider>
    )

    const image = screen.getByRole('img', { name: 'Test Journey Title' })
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'https://example.com/test-image.jpg')
  })

  it('displays GridEmptyIcon when no primary image is available', () => {
    const journeyWithoutImage = {
      ...journey,
      primaryImageBlock: null
    }

    render(
      <JourneyProvider
        value={{ journey: journeyWithoutImage, variant: 'admin' }}
      >
        <ShareDrawer open={true} onClose={mockOnClose} />
      </JourneyProvider>
    )

    expect(screen.getByTestId('GridEmptyIcon')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    render(
      <JourneyProvider value={{ journey, variant: 'admin' }}>
        <ShareDrawer open={true} onClose={mockOnClose} />
      </JourneyProvider>
    )

    const closeButton = screen.getByLabelText('close-share-drawer')
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('handles journey with minimal data', () => {
    const minimalJourney = {
      ...journey,
      seoTitle: null,
      seoDescription: null,
      displayTitle: null,
      primaryImageBlock: null
    }

    render(
      <JourneyProvider value={{ journey: minimalJourney, variant: 'admin' }}>
        <ShareDrawer open={true} onClose={mockOnClose} />
      </JourneyProvider>
    )

    expect(screen.getByText('Share!')).toBeInTheDocument()
    expect(screen.getByTestId('GridEmptyIcon')).toBeInTheDocument()
  })
})
