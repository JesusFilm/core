import { render, fireEvent, waitFor, within } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'
import { JOURNEY_DUPLICATE } from '../../../libs/useJourneyDuplicateMutation'
import {
  TeamProvider,
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
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

describe('DuplicateJourneys', () => {
  const handleCloseMenu = jest.fn()

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
              admin: true
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
  })
})
