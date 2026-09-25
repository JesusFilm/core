import { MockedProvider } from '@apollo/client/testing/react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { JourneyStatus } from '../../../__generated__/globalTypes'
import {
  makeAdminJourney,
  makeCampaign
} from '../../libs/campaignFields/campaignFixture'
import { GET_ADMIN_JOURNEYS } from '../../libs/useAdminJourneysQuery/useAdminJourneysQuery'
import { GET_CAMPAIGN_COUNTRY_STATS } from '../../libs/useCampaignCountryStatsQuery'
import { getCampaignMock } from '../../libs/useCampaignQuery/useCampaignQuery.mock'
import { CAMPAIGN_UPDATE } from '../../libs/useCampaignUpdateMutation'

import { CampaignBuilder } from './CampaignBuilder'

vi.mock('next/router', () => ({
  useRouter: () => ({
    asPath: '/campaigns/campaign-1',
    events: { on: vi.fn(), off: vi.fn(), emit: vi.fn() }
  })
}))
vi.mock('../../libs/useCanPublishCollection', () => ({
  useCanPublishCollection: () => ({
    canPublish: true,
    reason: null,
    loading: false
  })
}))
vi.mock('../../libs/useCampaignJourneyStatsQuery', () => ({
  useCampaignJourneyStatsQuery: () => ({
    data: undefined,
    loading: false,
    error: undefined
  })
}))

function adminJourneysMock(template: boolean) {
  return {
    request: {
      query: GET_ADMIN_JOURNEYS,
      variables: {
        teamId: 'team-1',
        template,
        status: [JourneyStatus.draft, JourneyStatus.published]
      }
    },
    result: {
      data: {
        journeys: template
          ? [
              makeAdminJourney({
                id: 'template-1',
                title: 'Template',
                template: true
              })
            ]
          : [makeAdminJourney()]
      }
    }
  }
}

const countryStatsMock = {
  request: {
    query: GET_CAMPAIGN_COUNTRY_STATS,
    variables: { id: 'campaign-1' }
  },
  result: {
    data: {
      campaign: {
        __typename: 'Campaign',
        id: 'campaign-1',
        countryStats: {
          __typename: 'CampaignCountryStats',
          from: '2026-06-01T00:00:00.000Z',
          to: '2026-09-24T00:00:00.000Z',
          totalVisitors: 0,
          totalPageviews: 0,
          countries: []
        }
      }
    }
  }
}

describe('CampaignBuilder', () => {
  it('loads the campaign, keeps Save disabled until edited, then saves the diff', async () => {
    const update = vi.fn(() => ({
      data: { campaignUpdate: makeCampaign({ title: 'Renamed' }) }
    }))
    render(
      <MockedProvider
        mocks={[
          getCampaignMock({ id: 'campaign-1' }, makeCampaign()),
          adminJourneysMock(false),
          adminJourneysMock(true),
          countryStatsMock,
          {
            request: {
              query: CAMPAIGN_UPDATE,
              variables: { id: 'campaign-1', input: { title: 'Renamed' } }
            },
            result: update
          }
        ]}
      >
        <ThemeProvider
          themeName={ThemeName.journeysAdmin}
          themeMode={ThemeMode.light}
        >
          <SnackbarProvider>
            <CampaignBuilder campaignId="campaign-1" />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    expect(
      await screen.findByTestId('CampaignBuilderActions')
    ).toBeInTheDocument()
    expect(screen.getByTestId('CampaignBuilderPublicUrl')).toHaveTextContent(
      'https://your.nextstep.is/campaign/world-cup-2026'
    )
    expect(screen.getByTestId('CampaignBuilderSave')).toBeDisabled()
    expect(screen.getByTestId('CampaignBuilderOpen')).toHaveAttribute(
      'aria-disabled',
      'true'
    )

    fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), {
      target: { value: 'Renamed' }
    })
    await waitFor(() =>
      expect(screen.getByTestId('CampaignBuilderSave')).toBeEnabled()
    )
    expect(screen.getByText('Unsaved')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('CampaignBuilderSave'))
    await waitFor(() => expect(update).toHaveBeenCalled())
    expect(await screen.findByText('Campaign saved')).toBeInTheDocument()
  })

  it('shows a not-found message when the campaign query returns nothing', async () => {
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: getCampaignMock({ id: 'missing' }, makeCampaign()).request
                .query,
              variables: { id: 'missing' }
            },
            error: new Error('campaign not found')
          }
        ]}
      >
        <SnackbarProvider>
          <CampaignBuilder campaignId="missing" />
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(await screen.findByTestId('CampaignBuilderError')).toHaveTextContent(
      "Couldn't load this campaign (campaign not found). Refresh to try again."
    )
  })
})
