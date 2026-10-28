import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { campaignSiteId } from '@core/journeys/ui/campaignPlausible'

import type {
  GetCampaignReport,
  GetCampaignReportVariables
} from '../../../__generated__/GetCampaignReport'
import { PlausibleEmbedFrame } from '../PlausibleEmbedDashboard'

export const GET_CAMPAIGN_REPORT = gql`
  query GetCampaignReport($id: ID!) {
    campaign(id: $id) {
      id
      plausibleToken
    }
  }
`

interface CampaignReportProps {
  campaignId: string
  host?: string // for testing
}

/**
 * The Campaign Report's body: the Campaign's own Plausible site
 * (`api-journeys-campaign-<id>`) as Plausible's dashboard, embedded with the
 * campaign's shared-link token like a journey's report. Until the plausible
 * worker has created the site, shortly after the campaign is created, it says
 * the report is being set up.
 */
export function CampaignReport({
  campaignId,
  host
}: CampaignReportProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { data, loading, error } = useQuery<
    GetCampaignReport,
    GetCampaignReportVariables
  >(GET_CAMPAIGN_REPORT, { variables: { id: campaignId } })
  const plausibleToken = data?.campaign.plausibleToken

  if (!loading && error == null && data != null && plausibleToken == null)
    return (
      <Stack
        sx={{ minHeight: '50vh', alignItems: 'center', justifyContent: 'center' }}
      >
        <Typography variant="overline" sx={{ color: 'secondary.light' }}>
          {t('The report is being set up. Check back in a few minutes.')}
        </Typography>
      </Stack>
    )

  return (
    <PlausibleEmbedFrame
      siteId={campaignSiteId(campaignId)}
      auth={loading ? null : plausibleToken}
      error={error != null}
      host={host}
    />
  )
}
