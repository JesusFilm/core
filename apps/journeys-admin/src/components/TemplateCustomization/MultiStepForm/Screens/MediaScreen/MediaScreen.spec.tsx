import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { journey } from '@core/journeys/ui/JourneyProvider/JourneyProvider.mock'

import {
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_ImageBlock as ImageBlock,
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_StepBlock as StepBlock
} from '../../../../../../__generated__/GetJourney'

import { MediaScreen } from './MediaScreen'

describe('MediaScreen', () => {
  const handleNext = jest.fn()

  const baseJourney = {
    ...journey,
    id: 'test-journey-id',
    blocks: [
      {
        id: 'step1.id',
        __typename: 'StepBlock',
        parentBlockId: null,
        parentOrder: 0,
        locked: false,
        nextBlockId: null
      } as StepBlock,
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
        src: 'https://example.com/image1.jpg',
        alt: 'image 1',
        width: 100,
        height: 100,
        blurhash: '',
        customizable: true,
        scale: null,
        focalTop: null,
        focalLeft: null
      } as ImageBlock,
      {
        id: 'step2.id',
        __typename: 'StepBlock',
        parentBlockId: null,
        parentOrder: 1,
        locked: false,
        nextBlockId: null
      } as StepBlock,
      {
        id: 'card2.id',
        __typename: 'CardBlock',
        parentBlockId: 'step2.id',
        parentOrder: 0,
        backgroundColor: null,
        coverBlockId: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        backdropBlur: null
      } as CardBlock,
      {
        id: 'image2.id',
        __typename: 'ImageBlock',
        parentBlockId: 'card2.id',
        parentOrder: 0,
        src: 'https://example.com/image2.jpg',
        alt: 'image 2',
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
    journeyData: Journey = baseJourney,
    mocks: MockedResponse[] = []
  ): ReturnType<typeof render> => {
    return render(
      <MockedProvider mocks={mocks}>
        <JourneyProvider value={{ journey: journeyData, variant: 'admin' }}>
          <MediaScreen handleNext={handleNext} />
        </JourneyProvider>
      </MockedProvider>
    )
  }

  it('should render the MediaScreen', () => {
    renderMediaScreen()
    expect(screen.getByText('Media')).toBeInTheDocument()
    expect(screen.getByTestId('CustomizeFlowNextButton')).toHaveTextContent(
      'Next'
    )
  })

  it('should call handleNext when Next button is clicked', () => {
    renderMediaScreen()

    const nextButton = screen.getByTestId('CustomizeFlowNextButton')
    fireEvent.click(nextButton)

    expect(handleNext).toHaveBeenCalledTimes(1)
  })

  it('should render section components and handle step selection', () => {
    renderMediaScreen()

    expect(screen.getByTestId('LogoSection')).toBeInTheDocument()
    expect(screen.getByTestId('CardsSection')).toBeInTheDocument()
    expect(screen.getByTestId('ImagesSection')).toBeInTheDocument()
    expect(screen.getByTestId('VideosSection')).toBeInTheDocument()

    // Initial state: first customizable step selected
    expect(screen.getByTestId('ImagesSection-file-input-image1.id')).toBeInTheDocument()
    expect(screen.queryByTestId('ImagesSection-file-input-image2.id')).not.toBeInTheDocument()

    // Click on second step
    const steps = screen.getAllByTestId('TemplateCardPreviewItem')
    if (steps.length >= 2) {
      fireEvent.click(steps[1])
      expect(screen.getByTestId('ImagesSection-file-input-image2.id')).toBeInTheDocument()
      expect(screen.queryByTestId('ImagesSection-file-input-image1.id')).not.toBeInTheDocument()
    }
  })

  it('should hide ImagesSection when selected card has no customizable images', () => {
    const journeyWithMixedImages = {
      ...baseJourney,
      blocks: [
        ...(baseJourney.blocks ?? []),
        {
          id: 'step3.id',
          __typename: 'StepBlock',
          parentBlockId: null,
          parentOrder: 2,
          locked: false,
          nextBlockId: null
        } as StepBlock,
        {
          id: 'card3.id',
          __typename: 'CardBlock',
          parentBlockId: 'step3.id',
          parentOrder: 0,
          backgroundColor: null,
          coverBlockId: null,
          themeMode: null,
          themeName: null,
          fullscreen: false,
          backdropBlur: null
        } as CardBlock,
        {
          id: 'image3.id',
          __typename: 'ImageBlock',
          parentBlockId: 'card3.id',
          parentOrder: 0,
          src: 'https://example.com/image3.jpg',
          alt: 'image 3',
          width: 100,
          height: 100,
          blurhash: '',
          customizable: false, // Not customizable
          scale: null,
          focalTop: null,
          focalLeft: null
        } as ImageBlock,
        {
          id: 'video1.id',
          __typename: 'VideoBlock',
          parentBlockId: 'card3.id',
          parentOrder: 1,
          customizable: true // This step is still customizable because of video
        }
      ]
    } as unknown as Journey

    renderMediaScreen(journeyWithMixedImages)

    // Step 1 selected by default (has images)
    expect(screen.getByTestId('ImagesSection')).toBeInTheDocument()

    // Click on third step (has no customizable images, but has customizable video)
    const steps = screen.getAllByTestId('TemplateCardPreviewItem')
    if (steps.length >= 3) {
      fireEvent.click(steps[2])
      expect(screen.queryByTestId('ImagesSection')).not.toBeInTheDocument()
    }
  })
})
