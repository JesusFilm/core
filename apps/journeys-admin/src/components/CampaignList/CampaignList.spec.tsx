import { MockLink } from '@apollo/client/testing'
import { MockedProvider } from '@apollo/client/testing/react'
import { fireEvent, render, screen } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'
import { type MockedFunction } from 'vitest'

import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '@core/journeys/ui/TeamProvider'
import { GetLastActiveTeamIdAndTeams } from '@core/journeys/ui/TeamProvider/__generated__/GetLastActiveTeamIdAndTeams'
import { getLastActiveTeamIdAndTeamsMock } from '@core/journeys/ui/TeamProvider/TeamProvider.mock'

import { CampaignStatus } from '../../../__generated__/globalTypes'
import { GET_CAMPAIGNS } from '../../libs/useCampaignsQuery'

import { CampaignList } from './CampaignList'

vi.mock('next/router', () => ({
  __esModule: true,
  useRouter: vi.fn()
}))

const mockUseRouter = useRouter as MockedFunction<typeof useRouter>

const campaignsMock = {
  request: { query: GET_CAMPAIGNS, variables: { teamId: 'teamId' } },
  result: {
    data: {
      campaigns: [
        {
          __typename: 'Campaign',
          id: 'campaignId',
          teamId: 'teamId',
          title: 'Outreach 2026',
          slug: 'outreach-2026',
          status: CampaignStatus.published,
          publishedAt: '2026-10-05T00:00:00.000Z',
          createdAt: '2026-10-05T00:00:00.000Z',
          updatedAt: '2026-10-05T00:00:00.000Z',
          customDomains: [
            {
              __typename: 'CustomDomain',
              id: 'customDomainId',
              name: 'outreach.example.com'
            }
          ]
        },
        {
          __typename: 'Campaign',
          id: 'hopeId',
          teamId: 'teamId',
          title: 'Outreach 2027',
          slug: 'hope-2027',
          status: CampaignStatus.draft,
          publishedAt: null,
          createdAt: '2026-10-05T00:00:00.000Z',
          updatedAt: '2026-10-05T00:00:00.000Z',
          customDomains: []
        }
      ]
    }
  }
}

const campaignsErrorMock = {
  request: { query: GET_CAMPAIGNS, variables: { teamId: 'teamId' } },
  error: new Error('Bad gateway')
}

const emptyCampaignsMock = {
  request: { query: GET_CAMPAIGNS, variables: { teamId: 'teamId' } },
  result: { data: { campaigns: [] } }
}

const noLastActiveTeamMock: MockLink.MockedResponse<GetLastActiveTeamIdAndTeams> =
  {
    request: { query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS },
    result: {
      data: {
        teams: [
          {
            __typename: 'Team',
            id: 'teamId',
            title: 'Team Title',
            publicTitle: null,
            userTeams: [],
            customDomains: []
          }
        ],
        getJourneyProfile: {
          id: 'someId',
          __typename: 'JourneyProfile',
          lastActiveTeamId: null
        }
      }
    }
  }

function renderList(
  mocks: unknown[] = [campaignsMock],
  teamsMock: unknown = getLastActiveTeamIdAndTeamsMock
): void {
  render(
    <MockedProvider mocks={[teamsMock, ...mocks] as never}>
      <SnackbarProvider>
        <TeamProvider>
          <CampaignList />
        </TeamProvider>
      </SnackbarProvider>
    </MockedProvider>
  )
}

describe('CampaignList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
    mockUseRouter.mockReturnValue({
      replace: vi.fn(),
      push: vi.fn(),
      query: {},
      pathname: '/'
    } as unknown as NextRouter)
  })

  it("lists the active team's campaigns with their status and editor links", async () => {
    renderList()

    expect(await screen.findByText('Outreach 2026')).toBeInTheDocument()
    expect(screen.getByText('Outreach 2027')).toBeInTheDocument()
    expect(screen.getByText('Published')).toBeInTheDocument()
    expect(screen.getByText('Draft')).toBeInTheDocument()
    expect(screen.getByTestId('CampaignListItem-campaignId')).toHaveAttribute(
      'href',
      '/campaigns/campaignId'
    )
  })

  it("shows a campaign's domain as its address, else its root-domain address", async () => {
    renderList()

    expect(
      await screen.findByText('https://outreach.example.com')
    ).toBeInTheDocument()
    expect(
      screen.queryByText('https://your.nextstep.is/campaign/outreach-2026')
    ).not.toBeInTheDocument()
    expect(
      screen.getByText('https://your.nextstep.is/campaign/hope-2027')
    ).toBeInTheDocument()
  })

  it('opens the Create dialog', async () => {
    renderList()

    await screen.findByText('Outreach 2026')
    fireEvent.click(screen.getByRole('button', { name: 'Create campaign' }))
    expect(screen.getByTestId('CreateCampaignDialog')).toBeInTheDocument()
  })

  it('asks for a team, skips the campaigns request and disables Create when no team is active', async () => {
    const campaignsResult = vi.fn(() => campaignsMock.result)
    renderList(
      [{ ...campaignsMock, result: campaignsResult }],
      noLastActiveTeamMock
    )

    expect(
      await screen.findByText('Pick a team to see its campaigns')
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Create campaign' })
    ).toBeDisabled()
    expect(screen.queryByTestId('CampaignListLoading')).not.toBeInTheDocument()
    expect(campaignsResult).not.toHaveBeenCalled()
  })

  it('shows an error with a retry, not the empty state, when the campaigns fail to load', async () => {
    renderList([campaignsErrorMock, campaignsMock])

    expect(
      await screen.findByText('There was an error loading campaigns.')
    ).toBeInTheDocument()
    expect(screen.queryByText(/No campaigns yet/)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))

    expect(await screen.findByText('Outreach 2026')).toBeInTheDocument()
    expect(
      screen.queryByText('There was an error loading campaigns.')
    ).not.toBeInTheDocument()
  })

  it('shows the empty state when the team has no campaigns', async () => {
    renderList([emptyCampaignsMock])

    expect(await screen.findByText(/No campaigns yet/)).toBeInTheDocument()
    expect(
      screen.queryByText('There was an error loading campaigns.')
    ).not.toBeInTheDocument()
  })
})
