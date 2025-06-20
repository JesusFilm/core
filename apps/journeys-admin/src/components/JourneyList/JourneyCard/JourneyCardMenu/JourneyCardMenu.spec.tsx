import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '@core/journeys/ui/TeamProvider'

import {
  JourneyStatus,
  UserTeamRole
} from '../../../../../__generated__/globalTypes'
import { ThemeProvider } from '../../../ThemeProvider'

import { JOURNEY_ARCHIVE } from './DefaultMenu/ArchiveJourney/ArchiveJourney'

import { JourneyCardMenu } from '.'

// Simple team mock to ensure Archive/Trash menu items appear
const teamMock = {
  request: {
    query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
  },
  result: {
    data: {
      getJourneyProfile: {
        id: 'profileId',
        lastActiveTeamId: 'teamId',
        __typename: 'JourneyProfile'
      },
      teams: [
        {
          id: 'teamId',
          title: 'Test Team',
          publicTitle: 'Test Team Public',
          userTeams: [
            {
              id: 'userTeamId',
              user: {
                id: 'userId',
                firstName: 'Test',
                lastName: 'User',
                imageUrl: null,
                email: 'test@example.com',
                __typename: 'User'
              },
              role: UserTeamRole.manager,
              __typename: 'UserTeam'
            }
          ],
          customDomains: [],
          __typename: 'Team'
        }
      ]
    }
  }
}

// Simple archive mutation mock
const archiveMock = {
  request: {
    query: JOURNEY_ARCHIVE,
    variables: { ids: ['journeyId'] }
  },
  result: {
    data: {
      journeysArchive: [
        {
          id: 'journeyId',
          status: JourneyStatus.archived,
          __typename: 'Journey'
        }
      ]
    }
  }
}

describe('JourneyCardMenu', () => {
  it('should open default menu on click', async () => {
    const { getByRole } = render(
      <MockedProvider mocks={[teamMock]}>
        <SnackbarProvider>
          <TeamProvider>
            <ThemeProvider>
              <JourneyCardMenu
                id="journeyId"
                status={JourneyStatus.published}
                slug="published-journey"
                published
              />
            </ThemeProvider>
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByRole('button')).toHaveAttribute(
      'aria-controls',
      'journey-actions'
    )
    expect(getByRole('button')).toHaveAttribute('aria-haspopup', 'true')
    expect(getByRole('button')).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(getByRole('button'))

    await waitFor(() =>
      expect(getByRole('menu')).toHaveAttribute(
        'aria-labelledby',
        'journey-actions'
      )
    )
    await waitFor(() =>
      expect(
        getByRole('menuitem', { name: 'Edit Details' })
      ).toBeInTheDocument()
    )
    expect(getByRole('menuitem', { name: 'Access' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Preview' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Duplicate' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Translate' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Copy to ...' })).toBeInTheDocument()
    await waitFor(() =>
      expect(getByRole('menuitem', { name: 'Archive' })).toBeInTheDocument()
    )
    expect(getByRole('menuitem', { name: 'Trash' })).toBeInTheDocument()
  })

  it('should open trash menu on click', async () => {
    const { getByRole, findByRole } = render(
      <MockedProvider mocks={[teamMock]}>
        <SnackbarProvider>
          <ThemeProvider>
            <JourneyCardMenu
              id="journeyId"
              status={JourneyStatus.trashed}
              slug="trashed-journey"
              published={false}
            />
          </ThemeProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByRole('button')).toHaveAttribute(
      'aria-controls',
      'journey-actions'
    )
    expect(getByRole('button')).toHaveAttribute('aria-haspopup', 'true')
    expect(getByRole('button')).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(getByRole('button'))

    await findByRole('menuitem', { name: 'Restore' })
    await findByRole('menuitem', { name: 'Delete Forever' })
  })

  it('should show access dialog on click', async () => {
    const { getByRole, queryByText, getByTestId, findByRole } = render(
      <MockedProvider mocks={[teamMock]}>
        <SnackbarProvider>
          <TeamProvider>
            <ThemeProvider>
              <JourneyCardMenu
                id="journeyId"
                status={JourneyStatus.draft}
                slug="draft-journey"
                published={false}
              />
            </ThemeProvider>
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    await findByRole('menuitem', { name: 'Access' })
    fireEvent.click(getByRole('menuitem', { name: 'Access' }))

    await waitFor(() =>
      expect(queryByText('Manage Editors')).toBeInTheDocument()
    )
    fireEvent.click(getByTestId('dialog-close-button'))
    await waitFor(() =>
      expect(queryByText('Manage Editors')).not.toBeInTheDocument()
    )
  })

  it('should show trash dialog on click', async () => {
    const { getByRole, queryByText, getByTestId } = render(
      <MockedProvider mocks={[teamMock, archiveMock]}>
        <SnackbarProvider>
          <TeamProvider>
            <ThemeProvider>
              <JourneyCardMenu
                id="journeyId"
                status={JourneyStatus.draft}
                slug="draft-journey"
                published={false}
              />
            </ThemeProvider>
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    await waitFor(() =>
      expect(getByRole('menuitem', { name: 'Trash' })).toBeInTheDocument()
    )
    fireEvent.click(getByRole('menuitem', { name: 'Trash' }))

    await waitFor(() =>
      expect(queryByText('Trash Journey?')).toBeInTheDocument()
    )
    fireEvent.click(getByTestId('dialog-close-button'))
    await waitFor(() =>
      expect(queryByText('Trash Journey?')).not.toBeInTheDocument()
    )
  })

  it('should show restore dialog on click', async () => {
    const { getByRole, queryByText, getByTestId, findByRole } = render(
      <MockedProvider mocks={[teamMock]}>
        <SnackbarProvider>
          <ThemeProvider>
            <JourneyCardMenu
              id="journeyId"
              status={JourneyStatus.trashed}
              slug="trashed-journey"
              published={false}
            />
          </ThemeProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    fireEvent.click(await findByRole('menuitem', { name: 'Restore' }))

    await waitFor(() =>
      expect(queryByText('Restore Journey?')).toBeInTheDocument()
    )
    fireEvent.click(getByTestId('dialog-close-button'))
    await waitFor(() =>
      expect(queryByText('Restore Journey?')).not.toBeInTheDocument()
    )
  })

  it('should show delete forever dialog on click', async () => {
    const { getByRole, queryByText, getByTestId, findByRole } = render(
      <MockedProvider mocks={[teamMock]}>
        <SnackbarProvider>
          <ThemeProvider>
            <JourneyCardMenu
              id="journeyId"
              status={JourneyStatus.trashed}
              slug="trashed-journey"
              published={false}
            />
          </ThemeProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    fireEvent.click(await findByRole('menuitem', { name: 'Delete Forever' }))

    await waitFor(() =>
      expect(queryByText('Delete Forever?')).toBeInTheDocument()
    )
    fireEvent.click(getByTestId('dialog-close-button'))
    await waitFor(() =>
      expect(queryByText('Delete Forever?')).not.toBeInTheDocument()
    )
  })

  it('should show translate dialog on click', async () => {
    const { getByRole, queryByText } = render(
      <MockedProvider mocks={[teamMock]}>
        <SnackbarProvider>
          <TeamProvider>
            <ThemeProvider>
              <JourneyCardMenu
                id="journeyId"
                status={JourneyStatus.published}
                slug="published-journey"
                published
              />
            </ThemeProvider>
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    await waitFor(() =>
      expect(getByRole('menuitem', { name: 'Translate' })).toBeInTheDocument()
    )
    fireEvent.click(getByRole('menuitem', { name: 'Translate' }))

    await waitFor(() =>
      expect(queryByText('Create Translated Copy')).toBeInTheDocument()
    )
    fireEvent.click(getByRole('button', { name: 'Cancel' }))
    await waitFor(() =>
      expect(queryByText('Create Translated Copy')).not.toBeInTheDocument()
    )
  })
})
