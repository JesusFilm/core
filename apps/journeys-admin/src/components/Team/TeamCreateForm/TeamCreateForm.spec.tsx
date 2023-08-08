import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { Form } from 'formik'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'

import { GetLastActiveTeamIdAndTeams } from '../../../../__generated__/GetLastActiveTeamIdAndTeams'
import { TeamCreate } from '../../../../__generated__/TeamCreate'
import { TEAM_CREATE } from '../../../libs/useTeamCreateMutation/useTeamCreateMutation'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider,
  useTeam
} from '../TeamProvider'

import { TeamCreateForm } from '.'

describe('TeamCreateForm', () => {
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
          __typename: 'Team',
          userTeams: []
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
  const getTeamsMock: MockedResponse<GetLastActiveTeamIdAndTeams> = {
    request: { query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS },
    result: {
      data: {
        teams: [
          {
            id: 'teamId',
            title: 'Team 1 Title',
            __typename: 'Team',
            userTeams: []
          }
        ],
        getJourneyProfile: {
          __typename: 'JourneyProfile',
          lastActiveTeamId: null
        }
      }
    }
  }
  function TestComponent(): ReactElement {
    const { activeTeam } = useTeam()

    return <div data-testid="active-team-title">{activeTeam?.title}</div>
  }

  it('creates new team and sets it as active', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      ROOT_QUERY: {
        __typename: 'Query',
        teams: [{ __ref: 'Team:teamId1' }]
      }
    })
    const handleSubmit = jest.fn()
    const { getByRole, getByTestId, getByText } = render(
      <MockedProvider mocks={[teamCreateMock, getTeamsMock]} cache={cache}>
        <SnackbarProvider>
          <TeamProvider>
            <TeamCreateForm onSubmit={handleSubmit}>
              {({ values, errors, handleChange, handleSubmit }) => (
                <Form>
                  <TextField
                    id="title"
                    name="title"
                    value={values.title}
                    error={Boolean(errors.title)}
                    onChange={handleChange}
                    helperText={errors.title}
                  />
                  <Button onClick={() => handleSubmit()}>Create</Button>
                </Form>
              )}
            </TeamCreateForm>
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
    await waitFor(() =>
      expect(handleSubmit).toHaveBeenCalledWith(
        { title: 'Team Title' },
        expect.any(Object),
        {
          teamCreate: {
            __typename: 'Team',
            id: 'teamId',
            title: 'Team Title',
            userTeams: []
          }
        }
      )
    )
    expect(cache.extract()?.ROOT_QUERY?.teams).toEqual([
      { __ref: 'Team:teamId' },
      { __ref: 'Team:teamId' }
    ])
    expect(getByText('{{ teamName }} created.')).toBeInTheDocument()
  })

  it('validates form', async () => {
    const handleSubmit = jest.fn()
    const { getByText, getByRole } = render(
      <MockedProvider mocks={[teamCreateErrorMock]}>
        <SnackbarProvider>
          <TeamProvider>
            <TeamCreateForm onSubmit={handleSubmit}>
              {({ values, errors, handleChange, handleSubmit }) => (
                <Form>
                  <TextField
                    id="title"
                    name="title"
                    value={values.title}
                    error={Boolean(errors.title)}
                    onChange={handleChange}
                    helperText={errors.title}
                  />
                  <Button onClick={() => handleSubmit()}>Create</Button>
                </Form>
              )}
            </TeamCreateForm>
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
    fireEvent.change(getByRole('textbox'), {
      target: { value: '12345678901234567890123456789012345678901' }
    })
    await waitFor(() =>
      expect(getByText('Max {{ count }} Characters')).toBeInTheDocument()
    )
    fireEvent.change(getByRole('textbox'), { target: { value: 'Team Title' } })
    fireEvent.click(getByRole('button', { name: 'Create' }))
    await waitFor(() =>
      expect(
        getByText('Failed to create the team. Reload the page or try again.')
      ).toBeInTheDocument()
    )
    expect(handleSubmit).not.toHaveBeenCalled()
  })
})
