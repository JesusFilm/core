import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor, within } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'
import { JOURNEY_DUPLICATE } from '../../../libs/useJourneyDuplicateMutation'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '../TeamProvider'

import { CopyToTeamMenuItem } from './CopyToTeamMenuItem'

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
              <CopyToTeamMenuItem
                id="journeyId"
                handleCloseMenu={handleCloseMenu}
              />
            </TeamProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(result2).toHaveBeenCalled())
    await fireEvent.click(getByRole('menuitem', { name: 'Copy to ...' }))
    const muiSelect = getByTestId('team-duplicate-select')
    const muiSelectDropDownButton = await within(muiSelect).getByRole('button')
    await fireEvent.mouseDown(muiSelectDropDownButton)
    const muiSelectOptions = await getByRole('option', {
      name: 'Team Name'
    })
    fireEvent.click(muiSelectOptions)
    await waitFor(() => fireEvent.click(getByText('Copy')))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(handleCloseMenu).toHaveBeenCalled()
    expect(getByText('Journey Copied')).toBeInTheDocument()

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith({
        query: { param: 'copy-journey' },
        push,
        events: {
          on
        }
      })
    })
  })
})
