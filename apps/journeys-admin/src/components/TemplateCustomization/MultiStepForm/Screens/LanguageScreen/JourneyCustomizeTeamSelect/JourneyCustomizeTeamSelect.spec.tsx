import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { Formik } from 'formik'
import noop from 'lodash/noop'

import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '@core/journeys/ui/TeamProvider'

import { JourneyCustomizeTeamSelect } from './JourneyCustomizeTeamSelect'

describe('JourneyCustomizeTeamSelect', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders selected team title', () => {
    const teams = [
      { id: 'teamId2', title: 'Team Two', publicTitle: 'Team 2' },
      { id: 'teamId1', title: 'Team One', publicTitle: 'Team 1' }
    ]

    const { getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: { query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS },
            result: {
              data: {
                getJourneyProfile: {
                  id: 'p1',
                  lastActiveTeamId: null,
                  __typename: 'JourneyProfile'
                },
                teams: teams.map((t) => ({
                  __typename: 'Team',
                  id: t.id,
                  title: t.title,
                  publicTitle: t.publicTitle,
                  userTeams: [],
                  customDomains: []
                }))
              }
            }
          }
        ]}
      >
        <TeamProvider>
          <Formik initialValues={{ teamSelect: 'teamId2' }} onSubmit={noop}>
            <JourneyCustomizeTeamSelect />
          </Formik>
        </TeamProvider>
      </MockedProvider>
    )

    return waitFor(() => expect(getByText('Team Two')).toBeInTheDocument())
  })

  it('falls back to publicTitle when title is not available', () => {
    const teams = [
      { id: 'teamId1', title: null, publicTitle: 'Team 1' },
      { id: 'teamId2', title: 'Team Two', publicTitle: 'Team 2' }
    ]

    const { getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: { query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS },
            result: {
              data: {
                getJourneyProfile: {
                  id: 'p1',
                  lastActiveTeamId: null,
                  __typename: 'JourneyProfile'
                },
                teams: teams.map((t) => ({
                  __typename: 'Team',
                  id: t.id,
                  title: t.title,
                  publicTitle: t.publicTitle,
                  userTeams: [],
                  customDomains: []
                }))
              }
            }
          }
        ]}
      >
        <TeamProvider>
          <Formik initialValues={{ teamSelect: 'teamId1' }} onSubmit={noop}>
            <JourneyCustomizeTeamSelect />
          </Formik>
        </TeamProvider>
      </MockedProvider>
    )

    return waitFor(() => expect(getByText('Team 1')).toBeInTheDocument())
  })

  it('lists teams sorted by title and updates selection', async () => {
    const teams = [
      { id: 'teamId3', title: 'Team Three', publicTitle: 'Team 3' },
      { id: 'teamId1', title: 'Team One', publicTitle: 'Team 1' },
      { id: 'teamId2', title: 'Team Two', publicTitle: 'Team 2' }
    ]

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: { query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS },
            result: {
              data: {
                getJourneyProfile: {
                  id: 'p1',
                  lastActiveTeamId: null,
                  __typename: 'JourneyProfile'
                },
                teams: teams.map((t) => ({
                  __typename: 'Team',
                  id: t.id,
                  title: t.title,
                  publicTitle: t.publicTitle,
                  userTeams: [],
                  customDomains: []
                }))
              }
            }
          }
        ]}
      >
        <TeamProvider>
          <Formik initialValues={{ teamSelect: 'teamId1' }} onSubmit={noop}>
            <JourneyCustomizeTeamSelect />
          </Formik>
        </TeamProvider>
      </MockedProvider>
    )

    const combobox = getByRole('combobox', { name: 'Team' })
    fireEvent.focus(combobox)
    fireEvent.keyDown(combobox, { key: 'ArrowDown' })

    await waitFor(async () => {
      expect(getByRole('option', { name: 'Team One' })).toBeInTheDocument()
      expect(getByRole('option', { name: 'Team Two' })).toBeInTheDocument()
      expect(getByRole('option', { name: 'Team Three' })).toBeInTheDocument()
    })

    fireEvent.click(getByRole('option', { name: 'Team Two' }))

    expect(getByRole('combobox', { name: 'Team' })).toHaveTextContent(
      'Team Two'
    )
  })
})
