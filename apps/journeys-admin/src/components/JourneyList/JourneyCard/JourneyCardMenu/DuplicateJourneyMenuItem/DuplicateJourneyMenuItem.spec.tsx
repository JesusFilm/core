import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor, within } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { UpdateLastActiveTeamId } from '../../../../../../__generated__/UpdateLastActiveTeamId'
import { JOURNEY_DUPLICATE } from '../../../../../libs/useJourneyDuplicateMutation'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '../../../../Team/TeamProvider'
import { UPDATE_LAST_ACTIVE_TEAM_ID } from '../../../../Team/TeamSelect/TeamSelect'

import { DuplicateJourneyMenuItem } from './DuplicateJourneyMenuItem'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({
    query: { tab: 'active' }
  }))
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('DuplicateJourneys', () => {
  const handleCloseMenu = jest.fn()

  beforeEach(() => jest.clearAllMocks())

  it('should duplicate a journey on menu card click', async () => {
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
                id: 'journeyId',
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
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <TeamProvider>
              <DuplicateJourneyMenuItem
                id="journeyId"
                handleCloseMenu={handleCloseMenu}
              />
            </TeamProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(result2).toHaveBeenCalled())
    await fireEvent.click(getByRole('menuitem', { name: 'Duplicate' }))
    expect(getByTestId('journey-duplicate-loader')).toBeInTheDocument()
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(handleCloseMenu).toHaveBeenCalled()
    expect(getByText('Journey Duplicated')).toBeInTheDocument()
  })

  it('should open copy to team dialog when on shared with me', async () => {
    const push = jest.fn()
    const events = { on: jest.fn() }

    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events
    } as unknown as NextRouter)

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
          lastActiveTeamId: null
        }
      }
    }))

    const updateLastActiveTeamIdMock: MockedResponse<UpdateLastActiveTeamId> = {
      request: {
        query: UPDATE_LAST_ACTIVE_TEAM_ID,
        variables: {
          input: {
            lastActiveTeamId: 'teamId'
          }
        }
      },
      result: jest.fn(() => ({
        data: {
          journeyProfileUpdate: {
            __typename: 'JourneyProfile',
            id: 'teamId'
          }
        }
      }))
    }

    const { getByRole, getByText, getByTestId } = render(
      <MockedProvider
        mocks={[
          updateLastActiveTeamIdMock,
          {
            request: {
              query: JOURNEY_DUPLICATE,
              variables: {
                id: 'journeyId',
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
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <TeamProvider>
              <DuplicateJourneyMenuItem
                id="journeyId"
                handleCloseMenu={handleCloseMenu}
              />
            </TeamProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(result2).toHaveBeenCalled())
    await fireEvent.click(getByRole('menuitem', { name: 'Duplicate' }))
    await waitFor(() => expect(result).not.toHaveBeenCalled())
    expect(push).toHaveBeenCalledWith({
      query: { param: 'duplicate-journey' },
      push,
      events
    })
    expect(getByText('Copy to Another Team')).toBeInTheDocument()
    const muiSelect = getByTestId('team-duplicate-select')
    const muiSelectDropDownButton = await within(muiSelect).getByRole('button')
    await fireEvent.mouseDown(muiSelectDropDownButton)
    const muiSelectOptions = await getByRole('option', {
      name: 'Team Name'
    })
    fireEvent.click(muiSelectOptions)
    await waitFor(() => fireEvent.click(getByText('Copy')))
    await waitFor(() =>
      expect(updateLastActiveTeamIdMock.result).toHaveBeenCalled()
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(handleCloseMenu).toHaveBeenCalled()
    await waitFor(() => expect(getByText('Journey Copied')).toBeInTheDocument())
  })

  it('should close copy to dialog', async () => {
    const { getByRole, getByText, queryByText } = render(
      <MockedProvider mocks={[]}>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <TeamProvider>
              <DuplicateJourneyMenuItem
                id="journeyId"
                handleCloseMenu={handleCloseMenu}
              />
            </TeamProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('menuitem'))
    expect(getByText('Copy to Another Team')).toBeInTheDocument()
    await waitFor(() =>
      fireEvent.click(getByRole('button', { name: 'Cancel' }))
    )
    await waitFor(() =>
      expect(queryByText('Copy to Another Team')).not.toBeInTheDocument()
    )
  })
})
