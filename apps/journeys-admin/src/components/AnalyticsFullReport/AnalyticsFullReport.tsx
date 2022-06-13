import { ReactElement } from 'react'
import { gql, useQuery } from '@apollo/client'
import { PowerBIEmbed } from 'powerbi-client-react'
import { models } from 'powerbi-client'
import { GetAdminJourneysReport } from '../../../__generated__/GetAdminJourneysReport'
import { JourneysReportType } from '../../../__generated__/globalTypes'

const GET_ADMIN_JOURNEYS_REPORT = gql`
  query GetAdminJourneysReport($reportType: JourneysReportType!) {
    adminJourneysReport(reportType: $reportType) {
      embedUrl: url
      accessToken: token
    }
  }
`

interface AnalyticsFullReportProps {
  reportType: JourneysReportType
}

export function AnalyticsFullReport({
  reportType
}: AnalyticsFullReportProps): ReactElement {
  const { data, loading } = useQuery<GetAdminJourneysReport>(
    GET_ADMIN_JOURNEYS_REPORT,
    {
      variables: { reportType }
    }
  )

  const embedConfig = {
    type: 'report',
    tokenType: models.TokenType.Embed,
    settings: undefined,
    emedUrl: data?.adminJourneysReport?.embedUrl,
    accessToken: data?.adminJourneysReport?.accessToken
  }

  return <>{!loading && <PowerBIEmbed embedConfig={embedConfig} />}</>
}
