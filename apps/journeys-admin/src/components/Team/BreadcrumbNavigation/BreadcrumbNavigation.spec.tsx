import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { type MockedFunction } from 'vitest'

import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '@core/journeys/ui/TeamProvider'

import { GetLastActiveTeamIdAndTeams } from '../../../../__generated__/GetLastActiveTeamIdAndTeams'

import { BreadcrumbNavigation } from './BreadcrumbNavigation'

vi.mock('next/router', () => ({
  __esModule: true,
  useRouter: vi.fn()
}))

const mockUseRouter = useRouter as MockedFunction<typeof useRouter>

describe('BreadcrumbNavigation', () => {
  const getTeamsMock: MockedResponse<GetLastActiveTeamIdAndTeams> = {
    request: {
      query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
    },
    result: {
      data: {
        getJourneyProfile: {
          __typename: 'JourneyProfile',
          id: 'journeyProfileId',
          lastActiveTeamId: 'team.id'
        },
        teams: [
          {
            __typename: 'Team',
            id: 'team.id',
            title: 'Jotaro Kujo',
            publicTitle: null,
            userTeams: [],
            customDomains: []
          }
        ]
      }
    }
  }

  it('should render breadcrumb navigation', async () => {
    mockUseRouter.mockReturnValue({
      asPath: '/teams/team.id/integrations/new'
    } as unknown as NextRouter)
    render(
      <MockedProvider mocks={[getTeamsMock]}>
        <TeamProvider>
          <BreadcrumbNavigation />
        </TeamProvider>
      </MockedProvider>
    )
    await waitFor(() => {
      expect(screen.getByText("Jotaro Kujo's Team")).toBeInTheDocument()
    })
    expect(screen.getByText('Integrations')).toBeInTheDocument()
    expect(screen.getByText('New')).toBeInTheDocument()
  })
})
