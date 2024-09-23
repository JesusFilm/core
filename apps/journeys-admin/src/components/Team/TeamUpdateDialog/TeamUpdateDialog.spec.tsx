import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { TeamProvider } from '@core/journeys/ui/TeamProvider'

import { TeamUpdate } from '../../../../__generated__/TeamUpdate'

import { TEAM_UPDATE } from './TeamUpdateDialog'

import { TeamUpdateDialog } from '.'
import '../../../../test/i18n'
import { getLastActiveTeamIdAndTeamsMock } from '@core/journeys/ui/TeamProvider/TeamProvider.mock'
import { mockUseCurrentUserLazyQuery } from '../../../libs/useCurrentUserLazyQuery/useCurrentUserLazyQuery.mock'

describe('TeamUpdateDialog', () => {
  const teamUpdateMock: MockedResponse<TeamUpdate> = {
    request: {
      query: TEAM_UPDATE,
      variables: {
        id: 'teamId',
        input: {
          title: 'Jesus Film Project',
          publicTitle: 'Jesus Film Project'
        }
      }
    },
    result: {
      data: {
        teamUpdate: {
          id: 'teamId',
          title: 'Jesus Film Project',
          publicTitle: 'Jesus Film Project',
          __typename: 'Team'
        }
      }
    }
  }
  const teamUpdateErrorMock: MockedResponse<TeamUpdate> = {
    request: {
      query: TEAM_UPDATE,
      variables: {
        id: 'teamId',
        input: {
          title: 'Team Title',
          publicTitle: ''
        }
      }
    },
    error: new Error('Team Title already exists.')
  }

  it('updates active team and sets it as active', async () => {
    const handleClose = jest.fn()
    const cache = new InMemoryCache()
    const { getByRole, getByText, getAllByRole } = render(
      <MockedProvider
        mocks={[
          getLastActiveTeamIdAndTeamsMock,
          teamUpdateMock,
          mockUseCurrentUserLazyQuery
        ]}
        cache={cache}
      >
        <SnackbarProvider>
          <TeamProvider>
            <TeamUpdateDialog open onClose={handleClose} />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getAllByRole('textbox')[0]).toHaveValue('Team Title')
    )
    expect(getAllByRole('textbox')[1]).toHaveAttribute(
      'placeholder',
      'Team Title'
    )
    fireEvent.change(getAllByRole('textbox')[0], {
      target: { value: 'Jesus Film Project' }
    })
    fireEvent.change(getAllByRole('textbox')[1], {
      target: { value: 'Jesus Film Project' }
    })
    fireEvent.click(getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(handleClose).toHaveBeenCalled())
    expect(getByText('Jesus Film Project updated.')).toBeInTheDocument()
  })

  it('should be disabled if user does not have required permissions', async () => {
    const handleClose = jest.fn()
    const cache = new InMemoryCache()
    const { getAllByRole, getAllByText } = render(
      <MockedProvider
        mocks={[getLastActiveTeamIdAndTeamsMock, teamUpdateMock]}
        cache={cache}
      >
        <SnackbarProvider>
          <TeamProvider>
            <TeamUpdateDialog open onClose={handleClose} />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getAllByRole('textbox')[0]).toBeDisabled()
    expect(getAllByRole('textbox')[1]).toBeDisabled()
    expect(getAllByText('Only a team manager can rename a team')).toHaveLength(
      2
    )
  })

  it('validates team field', async () => {
    const { getByText, getByRole, getAllByRole } = render(
      <MockedProvider
        mocks={[
          getLastActiveTeamIdAndTeamsMock,
          teamUpdateErrorMock,
          mockUseCurrentUserLazyQuery
        ]}
      >
        <SnackbarProvider>
          <TeamProvider>
            <TeamUpdateDialog open onClose={jest.fn()} />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getAllByRole('textbox')[0]).toHaveValue('Team Title')
    )
    fireEvent.change(getAllByRole('textbox')[0], { target: { value: '' } })
    fireEvent.click(getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(
        getByText('Team Name must be at least one character.')
      ).toBeInTheDocument()
    )
    fireEvent.change(getAllByRole('textbox')[0], {
      target: { value: '12345678901234567890123456789012345678901' }
    })
    await waitFor(() =>
      expect(getByText('Max 40 Characters')).toBeInTheDocument()
    )
    fireEvent.change(getAllByRole('textbox')[0], {
      target: { value: 'Team Title' }
    })
    fireEvent.click(getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(
        getByText('Failed to update the team. Reload the page or try again.')
      ).toBeInTheDocument()
    )
  })

  it('validates public name field', async () => {
    const { getByText, getAllByRole } = render(
      <MockedProvider
        mocks={[getLastActiveTeamIdAndTeamsMock, mockUseCurrentUserLazyQuery]}
      >
        <SnackbarProvider>
          <TeamProvider>
            <TeamUpdateDialog open onClose={jest.fn()} />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.change(getAllByRole('textbox')[1], {
      target: { value: '12345678901234567890123456789012345678901' }
    })
    await waitFor(() =>
      expect(getByText('Max 40 Characters')).toBeInTheDocument()
    )
  })
})
