import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor, within } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'
import TagManager from 'react-gtm-module'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { JOURNEY_DUPLICATE } from '../../../libs/useJourneyDuplicateMutation'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '../../Team/TeamProvider'
import { defaultJourney } from '../data'

import { JourneyViewFab } from './JourneyViewFab'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

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
        <SnackbarProvider>
          <TeamProvider>
            <JourneyProvider
              value={{ journey: defaultJourney, variant: 'admin' }}
            >
              <JourneyViewFab />
            </JourneyProvider>
          </TeamProvider>
        </SnackbarProvider>
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
        <SnackbarProvider>
          <TeamProvider>
            <JourneyProvider
              value={{
                journey: { ...defaultJourney, template: true },
                variant: 'admin'
              }}
            >
              <JourneyViewFab isPublisher />
            </JourneyProvider>
          </TeamProvider>
        </SnackbarProvider>
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

    const result2 = jest.fn(() => ({
      data: {
        teams: [{ id: 'teamId', title: 'Team Name', __typename: 'Team' }],
        getJourneyProfile: {
          __typename: 'JourneyProfile',
          lastActiveTeamId: 'teamId'
        }
      }
    }))

    const { getByRole, getByText, getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_DUPLICATE,
              variables: {
                id: 'journey-id',
                teamId: 'teamId'
              }
            },
            result
          },
          {
            request: {
              query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
            },
            result: result2
          }
        ]}
      >
        <SnackbarProvider>
          <TeamProvider>
            <JourneyProvider
              value={{ journey: { ...defaultJourney, template: true } }}
            >
              <JourneyViewFab />
            </JourneyProvider>
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(result2).toHaveBeenCalled())
    expect(getByText('Use Template')).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Use Template Use It' }))
    const muiSelect = getByTestId('team-duplicate-select')
    const muiSelectDropDownButton = await within(muiSelect).getByRole('button')
    await fireEvent.mouseDown(muiSelectDropDownButton)
    const muiSelectOptions = await getByRole('option', {
      name: 'Team Name'
    })
    fireEvent.click(muiSelectOptions)
    await waitFor(() => fireEvent.click(getByText('Add')))
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

    const result2 = jest.fn(() => ({
      data: {
        teams: [{ id: 'teamId', title: 'Team Name', __typename: 'Team' }],
        getJourneyProfile: {
          __typename: 'JourneyProfile',
          lastActiveTeamId: 'teamId'
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_DUPLICATE,
              variables: {
                id: 'journey-id',
                teamId: 'teamId'
              }
            },
            result: {
              data: {
                journeyDuplicate: {
                  id: 'duplicatedJourneyId'
                }
              }
            }
          },
          {
            request: {
              query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
            },
            result: result2
          }
        ]}
      >
        <SnackbarProvider>
          <TeamProvider>
            <JourneyProvider
              value={{ journey: { ...defaultJourney, template: true } }}
            >
              <JourneyViewFab />
            </JourneyProvider>
          </TeamProvider>
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
