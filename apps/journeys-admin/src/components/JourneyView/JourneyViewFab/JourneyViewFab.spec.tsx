import { render, fireEvent, waitFor } from '@testing-library/react'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { MockedProvider } from '@apollo/client/testing'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'
import TagManager from 'react-gtm-module'
import { defaultJourney } from '../data'
import { DUPLICATE_JOURNEY } from '../../../libs/useJourneyDuplicate'
import { JourneyViewFab } from './JourneyViewFab'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

jest.mock('react-gtm-module', () => ({
  __esModule: true,
  default: {
    dataLayer: jest.fn()
  }
}))

const mockedDataLayer = TagManager.dataLayer as jest.MockedFunction<
  typeof TagManager.dataLayer
>

describe('JourneyViewFab', () => {
  it('should redirect to journey editor on edit button click', () => {
    const { getByRole } = render(
      <MockedProvider>
        <FlagsProvider>
          <SnackbarProvider>
            <JourneyProvider value={{ journey: defaultJourney, admin: true }}>
              <JourneyViewFab />
            </JourneyProvider>
          </SnackbarProvider>
        </FlagsProvider>
      </MockedProvider>
    )
    expect(getByRole('link', { name: 'Edit' })).toHaveAttribute(
      'href',
      '/journeys/journey-id/edit'
    )
  })

  it('should redirect to template editor on edit button click', () => {
    const { getByRole } = render(
      <MockedProvider>
        <FlagsProvider>
          <SnackbarProvider>
            <JourneyProvider
              value={{
                journey: { ...defaultJourney, template: true },
                admin: true
              }}
            >
              <JourneyViewFab isPublisher />
            </JourneyProvider>
          </SnackbarProvider>
        </FlagsProvider>
      </MockedProvider>
    )
    expect(getByRole('link', { name: 'Edit' })).toHaveAttribute(
      'href',
      '/publisher/journey-id/edit'
    )
  })

  it('should convert template to journey on use template click', async () => {
    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)

    const result = jest.fn(() => {
      return {
        data: {
          journeyDuplicate: {
            id: 'duplicatedJourneyId'
          }
        }
      }
    })

    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: DUPLICATE_JOURNEY,
              variables: {
                id: 'journey-id'
              }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <FlagsProvider>
            <JourneyProvider
              value={{ journey: { ...defaultJourney, template: true } }}
            >
              <JourneyViewFab />
            </JourneyProvider>
          </FlagsProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByText('Use Template')).toBeInTheDocument()

    fireEvent.click(getByRole('button', { name: 'Use Template Use It' }))

    await waitFor(() => expect(result).toHaveBeenCalled())
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        '/journeys/duplicatedJourneyId',
        undefined,
        { shallow: true }
      )
    })
  })

  it('should send custom event to GTM when preview button is clicked', async () => {
    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: DUPLICATE_JOURNEY,
              variables: {
                id: 'journey-id'
              }
            },
            result: {
              data: {
                journeyDuplicate: {
                  id: 'duplicatedJourneyId'
                }
              }
            }
          }
        ]}
      >
        <SnackbarProvider>
          <FlagsProvider>
            <JourneyProvider
              value={{ journey: { ...defaultJourney, template: true } }}
            >
              <JourneyViewFab />
            </JourneyProvider>
          </FlagsProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Use Template Use It' }))

    await waitFor(() =>
      expect(mockedDataLayer).toHaveBeenCalledWith({
        dataLayer: {
          event: 'template_use',
          journeyId: 'journey-id',
          journeyTitle: 'Journey Heading'
        }
      })
    )
  })
})
