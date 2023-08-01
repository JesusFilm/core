import { fireEvent, render, waitFor } from '@testing-library/react'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import { Dispatch, ReactElement, SetStateAction } from 'react'
import { InMemoryCache } from '@apollo/client'
import useMediaQuery from '@mui/material/useMediaQuery'
import { TeamProvider, useTeam } from '../TeamProvider'
import { TeamCreate } from '../../../../__generated__/TeamCreate'
import { TEAM_CREATE } from '../../../libs/useTeamCreateMutation/useTeamCreateMutation'
import { TeamManageDialog } from '../TeamManageDialog'
import { TeamCreateDialog } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('TeamCreateDialog', () => {
  beforeEach(() => {
    ;(useMediaQuery as jest.Mock).mockImplementation(() => true)
  })
  const teamCreateMock: MockedResponse<TeamCreate> = {
    request: {
      query: TEAM_CREATE,
      variables: {
        input: {
          title: 'Team Title'
        }
      }
    },
    result: {
      data: {
        teamCreate: {
          id: 'teamId',
          title: 'Team Title',
          __typename: 'Team'
        }
      }
    }
  }
  const teamCreateErrorMock: MockedResponse<TeamCreate> = {
    request: {
      query: TEAM_CREATE,
      variables: {
        input: {
          title: 'Team Title'
        }
      }
    },
    error: new Error('Team Title already exists.')
  }
  function TestComponent(): ReactElement {
    const { activeTeam } = useTeam()

    return <div data-testid="active-team-title">{activeTeam?.title}</div>
  }

  it('creates new team and sets it as active', async () => {
    const handleClose = jest.fn()
    const cache = new InMemoryCache()
    cache.restore({
      ROOT_QUERY: {
        __typename: 'Query',
        teams: [{ __ref: 'Team:teamId1' }]
      }
    })
    const { getByRole, getByTestId, getByText } = render(
      <MockedProvider mocks={[teamCreateMock]} cache={cache}>
        <SnackbarProvider>
          <TeamProvider>
            <TeamCreateDialog
              open
              onClose={handleClose}
              setTeamManageOpen={jest.fn()}
            />
            <TestComponent />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.change(getByRole('textbox'), { target: { value: 'Team Title' } })
    fireEvent.click(getByRole('button', { name: 'Create' }))
    await waitFor(() =>
      expect(getByTestId('active-team-title')).toHaveTextContent('Team Title')
    )
    await waitFor(() => expect(handleClose).toHaveBeenCalled())
    expect(cache.extract()?.ROOT_QUERY?.teams).toEqual([
      { __ref: 'Team:teamId1' },
      { __ref: 'Team:teamId' }
    ])
    expect(getByText('{{ teamName }} created.')).toBeInTheDocument()
  })

  it('opens team manage dialog after creating a new team', async () => {
    const handleClose = jest.fn()
    let open = false
    const setOpen = (): void => {
      open = true
    }
    const cache = new InMemoryCache()
    cache.restore({
      ROOT_QUERY: {
        __typename: 'Query',
        teams: [{ __ref: 'Team:teamId1' }]
      }
    })
    const { getByRole, getByText } = render(
      <MockedProvider mocks={[teamCreateMock]} cache={cache}>
        <SnackbarProvider>
          <TeamProvider>
            <TeamCreateDialog
              open
              onClose={handleClose}
              setTeamManageOpen={
                setOpen() as unknown as Dispatch<SetStateAction<boolean>>
              }
            />
            <TeamManageDialog open={open} onClose={handleClose} />
            <TestComponent />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.change(getByRole('textbox'), { target: { value: 'Team Title' } })
    await waitFor(() => fireEvent.click(getByText('Create')))
    expect(getByText('Manage Members')).toBeInTheDocument()
    expect(getByText('Invite team member')).toBeInTheDocument()
  })

  it('validates form', async () => {
    const { getByText, getByRole } = render(
      <MockedProvider mocks={[teamCreateErrorMock]}>
        <SnackbarProvider>
          <TeamProvider>
            <TeamCreateDialog
              open
              onClose={jest.fn()}
              setTeamManageOpen={jest.fn()}
            />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.change(getByRole('textbox'), { target: { value: '' } })
    fireEvent.click(getByRole('button', { name: 'Create' }))
    await waitFor(() =>
      expect(
        getByText('Team Name must be at least one character.')
      ).toBeInTheDocument()
    )
    fireEvent.change(getByRole('textbox'), { target: { value: 'Team Title' } })
    await waitFor(() =>
      expect(getByRole('button', { name: 'Create' })).not.toBeDisabled()
    )
    fireEvent.click(getByRole('button', { name: 'Create' }))
    await waitFor(() =>
      expect(
        getByText('Failed to create the team. Reload the page or try again.')
      ).toBeInTheDocument()
    )
  })
})
