import { useApolloClient } from '@apollo/client/react'
import { MockedProvider } from '@apollo/client/testing/react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { ReactElement, useEffect } from 'react'

import { GetCampaign_campaign as Campaign } from '../../../__generated__/GetCampaign'
import { GET_CAMPAIGN } from '../../libs/useCampaignQuery'
import { campaign } from '../CampaignEditor/data'
import { campaignCache } from '../CampaignEditor/testing'

import { CampaignEditorPage } from './CampaignEditorPage'

const mockEditorMounted = vi.fn()

vi.mock('../CampaignEditor', () => ({
  CampaignEditor: ({
    campaign: campaignProp
  }: {
    campaign?: Campaign
  }): ReactElement => {
    useEffect(() => {
      mockEditorMounted()
    }, [])
    return <div data-testid="CampaignEditor">{campaignProp?.title}</div>
  }
}))

const request = { query: GET_CAMPAIGN, variables: { id: campaign.id } }
const campaignResult = { request, result: { data: { campaign } } }
const campaignError = { request, error: new Error('Bad gateway') }

/** Refetches GetCampaign as the editor does after a translation run. */
function RefetchCampaign(): ReactElement {
  const client = useApolloClient()
  return (
    <button
      onClick={() => {
        void client
          .refetchQueries({ include: ['GetCampaign'] })
          .catch(() => undefined)
      }}
    >
      refetch
    </button>
  )
}

function renderPage(mocks: unknown[]): void {
  render(
    <MockedProvider mocks={mocks as never} cache={campaignCache()}>
      <SnackbarProvider>
        <CampaignEditorPage campaignId={campaign.id} />
        <RefetchCampaign />
      </SnackbarProvider>
    </MockedProvider>
  )
}

describe('CampaignEditorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the editor with the loaded campaign', async () => {
    renderPage([campaignResult])

    expect(await screen.findByTestId('CampaignEditor')).toHaveTextContent(
      campaign.title
    )
  })

  it('shows a way out when the first load fails', async () => {
    renderPage([campaignError, campaignResult])

    expect(await screen.findByText('Campaign not found')).toBeInTheDocument()
    expect(screen.getByText('Bad gateway')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Back to campaigns' })
    ).toHaveAttribute('href', '/campaigns')
    expect(
      screen.queryByText('There was an error refreshing the campaign.')
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))

    expect(await screen.findByTestId('CampaignEditor')).toHaveTextContent(
      campaign.title
    )
    expect(screen.queryByText('Campaign not found')).not.toBeInTheDocument()
  })

  it('keeps the editor mounted and raises one snackbar when a refetch fails', async () => {
    renderPage([campaignResult, campaignError])

    expect(await screen.findByTestId('CampaignEditor')).toHaveTextContent(
      campaign.title
    )

    fireEvent.click(screen.getByRole('button', { name: 'refetch' }))

    expect(
      await screen.findByText('There was an error refreshing the campaign.')
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(
        screen.getAllByText('There was an error refreshing the campaign.')
      ).toHaveLength(1)
    )
    expect(screen.getByTestId('CampaignEditor')).toHaveTextContent(
      campaign.title
    )
    expect(screen.queryByText('Campaign not found')).not.toBeInTheDocument()
    expect(mockEditorMounted).toHaveBeenCalledTimes(1)
  })
})
