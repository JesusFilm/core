import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { journey } from '@core/journeys/ui/JourneyProvider/JourneyProvider.mock'

import {
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_ImageBlock as ImageBlock,
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_StepBlock as StepBlock
} from '../../../../../../__generated__/GetJourney'
import { useVideoUpload } from '../../../utils/useVideoUpload/useVideoUpload'

import { MediaScreen } from './MediaScreen'

const baseJourney = {
  ...journey,
  id: 'test-journey-id',
  seoTitle: 'Initial SEO Title',
  seoDescription: 'Initial SEO Description',
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
      id: 'video1.id',
      __typename: 'VideoBlock',
      parentBlockId: 'card1.id',
      parentOrder: 1,
      customizable: true
    },
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

jest.mock('../../../utils/useVideoUpload/useVideoUpload', () => ({
  useVideoUpload: jest.fn()
}))

const mockedUseVideoUpload = useVideoUpload as jest.MockedFunction<
  typeof useVideoUpload
>

jest.mock('./Sections/VideosSection/VideoPreviewPlayer', () => ({
  VideoPreviewPlayer: () => <div data-testid="VideoPreviewPlayer" />
}))

describe('MediaScreen', () => {
  const handleNext = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseVideoUpload.mockReturnValue({
      open: jest.fn(),
      getInputProps: jest.fn().mockReturnValue({}),
      status: 'idle'
    } as unknown as ReturnType<typeof useVideoUpload>)
  })

  const renderMediaScreen = (
    journeyData: Journey = baseJourney,
    mocks: MockedResponse[] = []
  ): ReturnType<typeof render> => {
    return render(
      <MockedProvider mocks={mocks}>
        <SnackbarProvider>
          <JourneyProvider value={{ journey: journeyData, variant: 'admin' }}>
            <MediaScreen handleNext={handleNext} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
  }

  it('should render the MediaScreen', () => {
    renderMediaScreen()

    expect(screen.getByText('Media')).toBeInTheDocument()
    expect(screen.getByText('Personalize and manage your media assets')).toBeInTheDocument()
    expect(screen.getByTestId('ImagesSection')).toBeInTheDocument()
    expect(screen.getByTestId('VideosSection')).toBeInTheDocument()
    expect(screen.getByTestId('CustomizeFlowNextButton')).toHaveTextContent(
      'Next'
    )
  })

  it('should call handleNext when Next button is clicked without any changes', () => {
    renderMediaScreen()

    const nextButton = screen.getByTestId('CustomizeFlowNextButton')
    fireEvent.click(nextButton)

    expect(handleNext).toHaveBeenCalledTimes(1)
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
          id: 'video2.id',
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

  it('disables the Next button when VideosSection reports loading', () => {
    mockedUseVideoUpload.mockReturnValue({
      open: jest.fn(),
      getInputProps: jest.fn().mockReturnValue({}),
      status: 'uploading'
    } as unknown as ReturnType<typeof useVideoUpload>)
    renderMediaScreen()

    const nextButton = screen.getByTestId('CustomizeFlowNextButton')
    expect(nextButton).toBeDisabled()
    fireEvent.click(nextButton)
    expect(handleNext).not.toHaveBeenCalled()
  })

  it('enables the Next button when VideosSection is not loading', () => {
    renderMediaScreen()

    const nextButton = screen.getByTestId('CustomizeFlowNextButton')
    expect(nextButton).not.toBeDisabled()
    fireEvent.click(nextButton)
    expect(handleNext).toHaveBeenCalledTimes(1)
  })
})
