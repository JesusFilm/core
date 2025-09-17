import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { journey } from '@core/journeys/ui/JourneyProvider/JourneyProvider.mock'

import { JOURNEY_SEO_TITLE_UPDATE } from '../../../../Editor/Slider/Settings/SocialDetails/TitleEdit/TitleEdit'
import { JOURNEY_SEO_DESCRIPTION_UPDATE } from '../../../../Editor/Slider/Settings/SocialDetails/DescriptionEdit/DescriptionEdit'

import type { JourneySeoTitleUpdate } from '../../../../../../__generated__/JourneySeoTitleUpdate'
import type { JourneySeoDescriptionUpdate } from '../../../../../../__generated__/JourneySeoDescriptionUpdate'

import { SocialScreen } from './SocialScreen'

describe('SocialScreen', () => {
  const handleNext = jest.fn()
  const handleScreenNavigation = jest.fn()

  const baseJourney = {
    ...journey,
    id: 'test-journey-id',
    seoTitle: 'Initial SEO Title',
    seoDescription: 'Initial SEO Description'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    handleNext.mockClear()
    handleScreenNavigation.mockClear()
  })

  const renderSocialScreen = (
    mocks: MockedResponse[] = []
  ): ReturnType<typeof render> => {
    return render(
      <MockedProvider mocks={mocks}>
        <JourneyProvider
          value={{ journey: baseJourney as any, variant: 'admin' }}
        >
          <SocialScreen
            handleNext={handleNext}
            handleScreenNavigation={handleScreenNavigation}
          />
        </JourneyProvider>
      </MockedProvider>
    )
  }

  it('should render the SocialScreen with title, social image and description', () => {
    renderSocialScreen()
    expect(screen.getByTestId('SocialScreenSocialImage')).toBeInTheDocument()
    expect(screen.getByTestId('TitleEdit')).toBeInTheDocument()
    expect(screen.getByTestId('DescriptionEdit')).toBeInTheDocument()
    expect(screen.getByTestId('DoneButton')).toBeInTheDocument()
  })

  it('should update SEO title and make correct network call', async () => {
    const result = jest.fn(() => ({
      data: {
        journeyUpdate: {
          __typename: 'Journey',
          id: 'test-journey-id',
          seoTitle: 'Updated Title for Social Media'
        }
      }
    }))

    const titleUpdateMock = {
      request: {
        query: JOURNEY_SEO_TITLE_UPDATE,
        variables: {
          id: 'test-journey-id',
          input: {
            seoTitle: 'Updated Title for Social Media'
          }
        }
      },
      result
    }

    renderSocialScreen([titleUpdateMock])
    const titleInput = screen.getByLabelText('Headline')

    fireEvent.change(titleInput, {
      target: { value: 'Updated Title for Social Media' }
    })
    fireEvent.blur(titleInput)

    await waitFor(() => expect(result).toHaveBeenCalled())

    expect(titleInput).toHaveValue('Updated Title for Social Media')
  })

  it('should update SEO description and make correct network call', async () => {
    const result = jest.fn(() => ({
      data: {
        journeyUpdate: {
          __typename: 'Journey',
          id: 'test-journey-id',
          seoDescription:
            'Updated description for social sharing that explains the journey content'
        }
      }
    }))

    const descriptionUpdateMock = {
      request: {
        query: JOURNEY_SEO_DESCRIPTION_UPDATE,
        variables: {
          id: 'test-journey-id',
          input: {
            seoDescription:
              'Updated description for social sharing that explains the journey content'
          }
        }
      },
      result
    }

    renderSocialScreen([descriptionUpdateMock])
    const descriptionInput = screen.getByLabelText('Secondary Text')

    fireEvent.change(descriptionInput, {
      target: {
        value:
          'Updated description for social sharing that explains the journey content'
      }
    })
    fireEvent.blur(descriptionInput)

    await waitFor(() => expect(result).toHaveBeenCalled())

    expect(descriptionInput).toHaveValue(
      'Updated description for social sharing that explains the journey content'
    )
  })

  it('should update both title and description, then call handleNext when Done button is clicked', async () => {
    const titleResult = jest.fn(() => ({
      data: {
        journeyUpdate: {
          __typename: 'Journey',
          id: 'test-journey-id',
          seoTitle: 'Final Title'
        }
      }
    }))

    const descriptionResult = jest.fn(() => ({
      data: {
        journeyUpdate: {
          __typename: 'Journey',
          id: 'test-journey-id',
          seoDescription: 'Final description for social media'
        }
      }
    }))

    const titleUpdateMock = {
      request: {
        query: JOURNEY_SEO_TITLE_UPDATE,
        variables: {
          id: 'test-journey-id',
          input: {
            seoTitle: 'Final Title'
          }
        }
      },
      result: titleResult
    }

    const descriptionUpdateMock = {
      request: {
        query: JOURNEY_SEO_DESCRIPTION_UPDATE,
        variables: {
          id: 'test-journey-id',
          input: {
            seoDescription: 'Final description for social media'
          }
        }
      },
      result: descriptionResult
    }

    renderSocialScreen([titleUpdateMock, descriptionUpdateMock])

    const titleInput = screen.getByLabelText('Headline')
    fireEvent.change(titleInput, { target: { value: 'Final Title' } })
    fireEvent.blur(titleInput)
    const descriptionInput = screen.getByLabelText('Secondary Text')
    fireEvent.change(descriptionInput, {
      target: { value: 'Final description for social media' }
    })
    fireEvent.blur(descriptionInput)

    await waitFor(() => expect(titleResult).toHaveBeenCalled())
    await waitFor(() => expect(descriptionResult).toHaveBeenCalled())

    const doneButton = screen.getByRole('button', { name: 'Done' })
    fireEvent.click(doneButton)

    expect(handleNext).toHaveBeenCalledTimes(1)
  })

  it('should call handleNext when Done button is clicked without any changes', () => {
    renderSocialScreen()

    const doneButton = screen.getByRole('button', { name: 'Done' })
    fireEvent.click(doneButton)

    expect(handleNext).toHaveBeenCalledTimes(1)
  })

  it('should render with correct initial values from journey context', () => {
    renderSocialScreen()

    const titleInput = screen.getByLabelText('Headline')
    const descriptionInput = screen.getByLabelText('Secondary Text')

    expect(titleInput).toHaveValue('Initial SEO Title')
    expect(descriptionInput).toHaveValue('Initial SEO Description')
  })
})
