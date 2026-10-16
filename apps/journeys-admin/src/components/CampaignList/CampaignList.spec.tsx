import { MockedProvider } from '@apollo/client/testing/react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'
import { type MockedFunction } from 'vitest'

import { TeamProvider } from '@core/journeys/ui/TeamProvider'
import { getLastActiveTeamIdAndTeamsMock } from '@core/journeys/ui/TeamProvider/TeamProvider.mock'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import { CampaignStatus } from '../../../__generated__/globalTypes'
import { GET_CAMPAIGNS } from '../../libs/useCampaignsQuery'
import { NavigationDrawer } from '../PageWrapper/NavigationDrawer/NavigationDrawer'

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
          title: 'Christmas 2026',
          slug: 'christmas-2026',
          status: CampaignStatus.published,
          publishedAt: '2026-10-05T00:00:00.000Z',
          createdAt: '2026-10-05T00:00:00.000Z',
          updatedAt: '2026-10-05T00:00:00.000Z'
        },
        {
          __typename: 'Campaign',
          id: 'easterId',
          teamId: 'teamId',
          title: 'Easter 2027',
          slug: 'easter-2027',
          status: CampaignStatus.draft,
          publishedAt: null,
          createdAt: '2026-10-05T00:00:00.000Z',
          updatedAt: '2026-10-05T00:00:00.000Z'
        }
      ]
    }
  }
}

function renderList(flags: Record<string, boolean>): void {
  render(
    <FlagsProvider flags={flags}>
      <MockedProvider mocks={[getLastActiveTeamIdAndTeamsMock, campaignsMock]}>
        <SnackbarProvider>
          <TeamProvider>
            <CampaignList />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    </FlagsProvider>
  )
}

describe('CampaignList', () => {
  const mockReplace = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseRouter.mockReturnValue({
      replace: mockReplace,
      push: vi.fn(),
      query: {},
      pathname: '/campaigns'
    } as unknown as NextRouter)
  })

  it("lists the active team's campaigns with their status and editor links", async () => {
    renderList({ campaignBuilder: true })

    expect(await screen.findByText('Christmas 2026')).toBeInTheDocument()
    expect(screen.getByText('Easter 2027')).toBeInTheDocument()
    expect(screen.getByText('Published')).toBeInTheDocument()
    expect(screen.getByText('Draft')).toBeInTheDocument()
    expect(screen.getByTestId('CampaignListItem-campaignId')).toHaveAttribute(
      'href',
      '/campaigns/campaignId'
    )
    expect(screen.getByText('/campaign/easter-2027')).toBeInTheDocument()
    expect(mockReplace).not.toHaveBeenCalled()
  })

  it('opens the Create dialog', async () => {
    renderList({ campaignBuilder: true })

    await screen.findByText('Christmas 2026')
    fireEvent.click(screen.getByRole('button', { name: 'Create campaign' }))
    expect(screen.getByTestId('CreateCampaignDialog')).toBeInTheDocument()
  })

  it('renders nothing and redirects home when the flag is off', async () => {
    renderList({ campaignBuilder: false })

    expect(screen.queryByTestId('CampaignList')).not.toBeInTheDocument()
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/'))
  })

  it('shows the Campaigns nav item only when the flag is on', () => {
    const { rerender } = render(
      <FlagsProvider flags={{ campaignBuilder: true }}>
        <NavigationDrawer selectedPage="campaigns" />
      </FlagsProvider>
    )
    expect(screen.getByTestId('NavigationListItemCampaigns')).toHaveAttribute(
      'href',
      '/campaigns'
    )

    rerender(
      <FlagsProvider flags={{ campaignBuilder: false }}>
        <NavigationDrawer selectedPage="campaigns" />
      </FlagsProvider>
    )
    expect(
      screen.queryByTestId('NavigationListItemCampaigns')
    ).not.toBeInTheDocument()
  })
})
