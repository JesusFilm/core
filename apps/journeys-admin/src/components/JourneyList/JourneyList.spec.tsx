import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { InMemoryCache } from '@apollo/client'
import { SnackbarProvider } from 'notistack'
import { v4 as uuidv4 } from 'uuid'
import { ThemeProvider } from '../ThemeProvider'
import {
  defaultJourney,
  publishedJourney,
  oldJourney,
  resultData
} from './journeyListData'
import { JOURNEY_CREATE } from './JourneyList'
import { JourneyList } from '.'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('JourneyList', () => {
  it('should render journeys in descending createdAt date by default', () => {
    const { getAllByLabelText } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyList journeys={[defaultJourney, oldJourney]} />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    const journeyCards = getAllByLabelText('journey-card')

    expect(journeyCards[0].textContent).toContain('January 1')
    expect(journeyCards[1].textContent).toContain('November 19, 2020')
  })

  it('should order journeys in alphabetical order', () => {
    const { getAllByLabelText, getByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyList journeys={[defaultJourney, oldJourney]} />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    const journeyCards = getAllByLabelText('journey-card')

    fireEvent.click(getByRole('button', { name: 'Sort By' }))
    fireEvent.click(getByRole('radio', { name: 'Name' }))

    expect(journeyCards[0].textContent).toContain('Default Journey Heading')
    expect(journeyCards[1].textContent).toContain('An Old Journey Heading')
  })

  it('should render all journeys', () => {
    const { getAllByLabelText } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyList
              journeys={[defaultJourney, publishedJourney, oldJourney]}
            />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getAllByLabelText('journey-card').length).toBe(3)
  })

  it('should render text when there are no journeys', () => {
    const { getByText, getByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyList journeys={[]} />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    expect(getByText('No journeys to display.')).toBeInTheDocument()
    expect(
      getByText('Create a journey, then find it here.')
    ).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Create a Journey' })
    ).toBeInTheDocument()
  })

  it('should check if the mutation gets called on AddJourneyFab click', async () => {
    mockUuidv4.mockReturnValueOnce('journeyId')
    mockUuidv4.mockReturnValueOnce('stepId')
    mockUuidv4.mockReturnValueOnce('cardId')
    mockUuidv4.mockReturnValueOnce('imageId')
    const cache = new InMemoryCache()
    cache.restore({
      ROOT_QUERY: {
        __typename: 'Query',
        adminJourneys: []
      }
    })
    const result = jest.fn(() => ({
      data: resultData
    }))
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider
          cache={cache}
          mocks={[
            {
              request: {
                query: JOURNEY_CREATE,
                variables: {
                  journeyId: 'journeyId',
                  title: 'Untitled Journey',
                  slug: `untitled-journey-journeyId`,
                  description:
                    'Use journey description for notes about the audience, topic, traffic source, etc. Only you and other editors can see it.',
                  stepId: 'stepId',
                  cardId: 'cardId',
                  imageId: 'imageId',
                  alt: 'two hot air balloons in the sky',
                  headlineTypography: 'The Journey Is On',
                  bodyTypography: '"Go, and lead the people on their way..."',
                  captionTypography: 'Deutoronomy 10:11'
                }
              },
              result
            }
          ]}
        >
          <ThemeProvider>
            <JourneyList journeys={[defaultJourney]} />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByRole('button', { name: 'Add' })).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(cache.extract()?.ROOT_QUERY?.adminJourneys).toEqual([
      { __ref: 'Journey:journeyId' }
    ])
  })

  it('should check if the mutations gets called on AddJourneyButton click', async () => {
    mockUuidv4.mockReturnValueOnce('journeyId')
    mockUuidv4.mockReturnValueOnce('stepId')
    mockUuidv4.mockReturnValueOnce('cardId')
    mockUuidv4.mockReturnValueOnce('imageId')
    const cache = new InMemoryCache()
    cache.restore({
      ROOT_QUERY: {
        __typename: 'Query',
        adminJourneys: []
      }
    })
    const result = jest.fn(() => ({
      data: resultData
    }))
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider
          cache={cache}
          mocks={[
            {
              request: {
                query: JOURNEY_CREATE,
                variables: {
                  journeyId: 'journeyId',
                  title: 'Untitled Journey',
                  slug: `untitled-journey-journeyId`,
                  description:
                    'Use journey description for notes about the audience, topic, traffic source, etc. Only you and other editors can see it.',
                  stepId: 'stepId',
                  cardId: 'cardId',
                  imageId: 'imageId',
                  alt: 'two hot air balloons in the sky',
                  headlineTypography: 'The Journey Is On',
                  bodyTypography: '"Go, and lead the people on their way..."',
                  captionTypography: 'Deutoronomy 10:11'
                }
              },
              result
            }
          ]}
        >
          <ThemeProvider>
            <JourneyList journeys={[]} />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(
      getByRole('button', { name: 'Create a Journey' })
    ).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Create a Journey' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(cache.extract()?.ROOT_QUERY?.adminJourneys).toEqual([
      { __ref: 'Journey:journeyId' }
    ])
  })
})
