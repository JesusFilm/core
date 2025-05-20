import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor, within } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '@core/journeys/ui/TeamProvider'
import { GetLastActiveTeamIdAndTeams } from '@core/journeys/ui/TeamProvider/__generated__/GetLastActiveTeamIdAndTeams'
import { JOURNEY_DUPLICATE } from '@core/journeys/ui/useJourneyDuplicateMutation'
import { JourneyDuplicate } from '@core/journeys/ui/useJourneyDuplicateMutation/__generated__/JourneyDuplicate'
import { UPDATE_LAST_ACTIVE_TEAM_ID } from '@core/journeys/ui/useUpdateLastActiveTeamIdMutation'

import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'
import { UpdateLastActiveTeamId } from '../../../../__generated__/UpdateLastActiveTeamId'
import { defaultJourney } from '../../JourneyList/ActiveJourneyList/ActivePriorityList/ActiveJourneyListData'

import { CopyToTeamMenuItem } from './CopyToTeamMenuItem'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({ query: { tab: 'active' } }))
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('DuplicateJourneys', () => {
  const handleCloseMenu = jest.fn()
  const push = jest.fn()
  const on = jest.fn()

  it('should duplicate a journey on menu card click', async () => {
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)

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

    const duplicateJourneyMock: MockedResponse<JourneyDuplicate> = {
      request: {
        query: JOURNEY_DUPLICATE,
        variables: {
          id: 'journeyId',
          teamId: 'teamId'
        }
      },
      result: jest.fn(() => ({
        data: {
          journeyDuplicate: {
            id: 'duplicatedJourneyId',
            __typename: 'Journey'
          }
        }
      }))
    }

    const getLastActiveTeamIdAndTeamsMock: MockedResponse<GetLastActiveTeamIdAndTeams> =
      {
        request: {
          query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
        },
        result: jest.fn(() => ({
          data: {
            teams: [
              {
                id: 'teamId',
                title: 'Team Name',
                __typename: 'Team',
                publicTitle: 'Team Name',
                userTeams: [],
                customDomains: []
              }
            ],
            getJourneyProfile: {
              __typename: 'JourneyProfile',
              id: 'journeyProfileId',
              lastActiveTeamId: 'teamId'
            }
          }
        }))
      }

    const { getByRole, getByText, getByTestId } = render(
      <MockedProvider
        mocks={[
          updateLastActiveTeamIdMock,
          duplicateJourneyMock,
          getLastActiveTeamIdAndTeamsMock
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
              <CopyToTeamMenuItem
                id="journeyId"
                handleCloseMenu={handleCloseMenu}
                journey={defaultJourney}
              />
            </TeamProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getLastActiveTeamIdAndTeamsMock.result).toHaveBeenCalled()
    )
    fireEvent.click(getByRole('menuitem', { name: 'Copy to ...' }))
    const muiSelect = getByTestId('team-duplicate-select')
    const muiSelectDropDownButton = within(muiSelect).getByRole('combobox')
    fireEvent.mouseDown(muiSelectDropDownButton)
    const muiSelectOptions = getByRole('option', {
      name: 'Team Name'
    })
    fireEvent.click(muiSelectOptions)
    await waitFor(() => fireEvent.click(getByText('Copy')))
    await waitFor(() => expect(duplicateJourneyMock.result).toHaveBeenCalled())
    await waitFor(() =>
      expect(updateLastActiveTeamIdMock.result).toHaveBeenCalled()
    )
    expect(handleCloseMenu).toHaveBeenCalled()
    expect(getByText('Journey Copied')).toBeInTheDocument()

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        {
          query: { param: 'copy-journey' }
        },
        undefined,
        { shallow: true }
      )
    })
  })
})
