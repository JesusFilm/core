import { MockedProvider } from '@apollo/client/testing/react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { makeCampaign } from '../../libs/campaignFields/campaignFixture'
import { getCampaignsMock } from '../../libs/useCampaignsQuery/useCampaignsQuery.mock'

import { CampaignList } from './CampaignList'

const mockActiveTeam = vi.hoisted((): { current: { id: string } | null } => ({
  current: { id: 'team-1' }
}))
vi.mock('@core/journeys/ui/TeamProvider', () => ({
  useTeam: () => ({ activeTeam: mockActiveTeam.current })
}))
vi.mock('../../libs/useCanPublishCollection', () => ({
  useCanPublishCollection: () => ({
    canPublish: true,
    reason: null,
    loading: false
  })
}))
vi.mock('next/router', () => ({
  useRouter: () => ({ push: vi.fn() })
}))

describe('CampaignList', () => {
  beforeEach(() => {
    mockActiveTeam.current = { id: 'team-1' }
  })

  it('renders the empty state and opens the create dialog', async () => {
    const mock = getCampaignsMock({ teamId: 'team-1' }, [])
    render(
      <MockedProvider mocks={[mock]}>
        <SnackbarProvider>
          <CampaignList />
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(await screen.findByTestId('CampaignListEmpty')).toBeInTheDocument()
    expect(mock.result).toHaveBeenCalled()

    fireEvent.click(screen.getByTestId('CampaignListCreate'))
    expect(
      await screen.findByTestId('CampaignCreateDialog')
    ).toBeInTheDocument()
  })

  it('renders a card per campaign', async () => {
    render(
      <MockedProvider
        mocks={[
          getCampaignsMock({ teamId: 'team-1' }, [
            makeCampaign(),
            makeCampaign({
              id: 'campaign-2',
              title: 'Euro 2028',
              slug: 'euro-2028'
            })
          ])
        ]}
      >
        <SnackbarProvider>
          <CampaignList />
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(screen.getByTestId('CampaignCard-campaign-1')).toBeInTheDocument()
    )
    expect(screen.getByTestId('CampaignCard-campaign-2')).toBeInTheDocument()
    expect(screen.getByText('Euro 2028')).toBeInTheDocument()
  })

  it('asks for a team when none is active', () => {
    mockActiveTeam.current = null
    render(
      <MockedProvider mocks={[]}>
        <SnackbarProvider>
          <CampaignList />
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(
      screen.getByText('Select a team to see its campaigns.')
    ).toBeInTheDocument()
    expect(screen.getByTestId('CampaignListCreate')).toBeDisabled()
  })
})
