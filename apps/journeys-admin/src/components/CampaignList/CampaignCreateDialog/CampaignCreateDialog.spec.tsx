import { MockedProvider } from '@apollo/client/testing/react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { makeCampaign } from '../../../libs/campaignFields/campaignFixture'
import { CAMPAIGN_CREATE } from '../../../libs/useCampaignCreateMutation'

import { CampaignCreateDialog } from './CampaignCreateDialog'

const mockPush = vi.hoisted(() => vi.fn())
vi.mock('next/router', () => ({
  useRouter: () => ({ push: mockPush })
}))

describe('CampaignCreateDialog', () => {
  beforeEach(() => {
    mockPush.mockReset()
  })

  it('creates a draft from the title and navigates to the builder', async () => {
    const result = vi.fn(() => ({
      data: { campaignCreate: makeCampaign({ id: 'new-campaign' }) }
    }))
    const onClose = vi.fn()
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: CAMPAIGN_CREATE,
              variables: {
                input: { teamId: 'team-1', title: 'World Cup 2026' }
              }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <CampaignCreateDialog open teamId="team-1" onClose={onClose} />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.change(screen.getByRole('textbox', { name: 'Campaign title' }), {
      target: { value: '  World Cup 2026 ' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => expect(result).toHaveBeenCalled())
    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith('/campaigns/new-campaign')
    )
    expect(onClose).toHaveBeenCalled()
  })

  it('requires a title', async () => {
    render(
      <MockedProvider mocks={[]}>
        <SnackbarProvider>
          <CampaignCreateDialog open teamId="team-1" onClose={vi.fn()} />
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Create' }))
    expect(await screen.findByText('Title is required')).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })
})
