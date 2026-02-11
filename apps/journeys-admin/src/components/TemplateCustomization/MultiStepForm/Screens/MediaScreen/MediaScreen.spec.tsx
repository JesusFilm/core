import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { journey } from '@core/journeys/ui/JourneyProvider/JourneyProvider.mock'

import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_ImageBlock as ImageBlock
} from '../../../../../../__generated__/GetJourney'
import { MediaScreen } from './MediaScreen'

describe('MediaScreen', () => {
  const handleNext = jest.fn()

  const baseJourney = {
    ...journey,
    id: 'test-journey-id',
    seoTitle: 'Initial SEO Title',
    seoDescription: 'Initial SEO Description',
    blocks: [
      {
        id: 'card1.id',
        __typename: 'CardBlock',
        parentBlockId: 'step1.id',
        parentOrder: 0,
        backgroundColor: null,
        coverBlockId: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        backdropBlur: null
      } as CardBlock,
      {
        id: 'image1.id',
        __typename: 'ImageBlock',
        parentBlockId: 'card1.id',
        parentOrder: 0,
        src: 'https://example.com/image.jpg',
        alt: 'image',
        width: 100,
        height: 100,
        blurhash: '',
        customizable: true,
        scale: null,
        focalTop: null,
        focalLeft: null
      } as ImageBlock
    ]
  } as unknown as Journey

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const renderMediaScreen = (
    mocks: MockedResponse[] = []
  ): ReturnType<typeof render> => {
    return render(
      <MockedProvider mocks={mocks}>
        <JourneyProvider value={{ journey: baseJourney, variant: 'admin' }}>
          <MediaScreen handleNext={handleNext} />
        </JourneyProvider>
      </MockedProvider>
    )
  }

  it('should render the MediaScreen', () => {
    render(<MediaScreen handleNext={handleNext} />)
    expect(screen.getByText('Media')).toBeInTheDocument()
    expect(screen.getByTestId('CustomizeFlowNextButton')).toHaveTextContent(
      'Next'
    )
  })

  it('should call handleNext when Done button is clicked without any changes', () => {
    renderMediaScreen()

    const doneButton = screen.getByTestId('CustomizeFlowNextButton')
    fireEvent.click(doneButton)

    expect(handleNext).toHaveBeenCalledTimes(1)
  })

  it('should render section components with visible data-testids when screen is shown', () => {
    renderMediaScreen()

    expect(screen.getByTestId('LogoSection')).toBeInTheDocument()
    expect(screen.getByTestId('CardsSection')).toBeInTheDocument()
    expect(screen.getByTestId('ImagesSection')).toBeInTheDocument()
    expect(screen.getByTestId('VideosSection')).toBeInTheDocument()
  })
})
