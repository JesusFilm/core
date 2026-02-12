import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { journey } from '@core/journeys/ui/JourneyProvider/JourneyProvider.mock'

import { MediaScreen } from './MediaScreen'

const baseJourney = {
  ...journey,
  id: 'test-journey-id',
  seoTitle: 'Initial SEO Title',
  seoDescription: 'Initial SEO Description'
}

const mockStep = {
  id: 'step-1',
  __typename: 'StepBlock',
  children: [{ id: 'card-1', __typename: 'CardBlock' }]
}

let mockVideosLoading = false

jest.mock('./Sections', () => {
  const React = require('react')
  const actual = jest.requireActual('./Sections')
  return {
    ...actual,
    VideosSection: ({
      onLoading
    }: {
      cardBlockId: string | null
      onLoading?: (loading: boolean) => void
    }) => {
      React.useEffect(() => {
        onLoading?.(mockVideosLoading)
      }, [onLoading])
      return React.createElement('div', { 'data-testid': 'VideosSection' })
    }
  }
})

jest.mock('./utils', () => {
  const actual = jest.requireActual('./utils')
  return {
    ...actual,
    showVideosSection: () => true,
    getCustomizableMediaSteps: () => [mockStep],
    getCardBlockIdFromStep: (step: { children?: Array<{ id: string }> }) =>
      step?.children?.[0]?.id ?? 'card-1'
  }
})

describe('MediaScreen', () => {
  const handleNext = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockVideosLoading = false
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
    renderMediaScreen()

    expect(screen.getByText('Media')).toBeInTheDocument()
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

  it('should render section components with visible data-testids when screen is shown', () => {
    renderMediaScreen()

    expect(screen.getByTestId('LogoSection')).toBeInTheDocument()
    expect(screen.getByTestId('ImagesSection')).toBeInTheDocument()
    expect(screen.getByTestId('VideosSection')).toBeInTheDocument()
  })

  it('disables the Next button when VideosSection reports loading', () => {
    mockVideosLoading = true
    renderMediaScreen()

    const nextButton = screen.getByTestId('CustomizeFlowNextButton')
    expect(nextButton).toBeDisabled()
    fireEvent.click(nextButton)
    expect(handleNext).not.toHaveBeenCalled()
  })

  it('enables the Next button when VideosSection is not loading', () => {
    mockVideosLoading = false
    renderMediaScreen()

    const nextButton = screen.getByTestId('CustomizeFlowNextButton')
    expect(nextButton).not.toBeDisabled()
    fireEvent.click(nextButton)
    expect(handleNext).toHaveBeenCalledTimes(1)
  })
})
