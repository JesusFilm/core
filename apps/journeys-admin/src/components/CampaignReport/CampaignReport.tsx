import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { ReactElement } from 'react'

import { campaignSiteId } from '@core/journeys/ui/campaignPlausible'

import type {
  GetCampaignReport,
  GetCampaignReportVariables
} from '../../../__generated__/GetCampaignReport'
import {
  PlausibleEmbedFrame,
  plausibleEmbedStatus
} from '../PlausibleEmbedFrame'

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
 * worker has created the site, shortly after the campaign is created, the
 * frame says the report is being set up.
 */
export function CampaignReport({
  campaignId,
  host
}: CampaignReportProps): ReactElement {
  const { data, loading, error } = useQuery<
    GetCampaignReport,
    GetCampaignReportVariables
  >(GET_CAMPAIGN_REPORT, { variables: { id: campaignId } })

  return (
    <PlausibleEmbedFrame
      siteId={campaignSiteId(campaignId)}
      status={plausibleEmbedStatus({
        loading,
        error,
        data: data?.campaign
      })}
      host={host}
    />
  )
}
