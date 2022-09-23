import { render, fireEvent, waitFor } from '@testing-library/react'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { MockedProvider } from '@apollo/client/testing'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'
import TagManager from 'react-gtm-module'
import { defaultJourney } from '../data'
import {
  CONVERT_TEMPLATE,
  TEMPLATE_USE_EVENT_CREATE,
  JourneyViewFab
} from './JourneyViewFab'

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
              query: CONVERT_TEMPLATE,
              variables: {
                id: 'journey-id'
              }
            },
            result
          },
          {
            request: {
              query: TEMPLATE_USE_EVENT_CREATE,
              variables: {
                input: { journeyId: 'journey-id' }
              }
            },
            result: {
              data: {
                templateUseEventCreate: {
                  __typename: 'TemplateUseEvent',
                  userId: 'user.id',
                  journeyId: 'journey-id',
                  id: 'event.id'
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
    expect(getByText('Use Template')).toBeInTheDocument()
    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(result).toHaveBeenCalled())
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        '/journeys/duplicatedJourneyId',
        undefined,
        { shallow: true }
      )
    })
  })

  it('should create event', async () => {
    const result = jest.fn(() => ({
      data: {
        templateUseEventCreate: {
          __typename: 'TemplateUseEvent',
          userId: 'user.id',
          journeyId: 'journey-id',
          id: 'event.id'
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: TEMPLATE_USE_EVENT_CREATE,
              variables: {
                input: { journeyId: 'journey-id' }
              }
            },
            result
          },
          {
            request: {
              query: CONVERT_TEMPLATE,
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

    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(result).toHaveBeenCalled)
    expect(mockedDataLayer).toHaveBeenCalledWith({
      dataLayer: {
        event: 'template_use',
        eventId: 'event.id',
        journeyId: 'journey-id',
        userId: 'user.id',
        journeyTitle: 'Journey Heading'
      }
    })
  })
})
