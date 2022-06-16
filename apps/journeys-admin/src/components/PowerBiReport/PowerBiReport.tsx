import { ReactElement, useEffect } from 'react'
import { PowerBIEmbed } from 'powerbi-client-react'
import { models } from 'powerbi-client'
import { gql, useQuery } from '@apollo/client'
import { JourneysReportType } from '../../../__generated__/globalTypes'
import { GetAdminJourneysReport } from '../../../__generated__/GetAdminJourneysReport'

const GET_ADMIN_JOURNEYS_REPORT = gql`
  query GetAdminJourneysReport($reportType: JourneysReportType!) {
    adminJourneysReport(reportType: $reportType) {
      reportId
      embedUrl
      accessToken
    }
  }
`

export interface PowerBiReportProps {
  reportType: JourneysReportType
  onLoad: () => void
  onError: () => void
}

export function PowerBiReport({
  reportType,
  onLoad,
  onError
}: PowerBiReportProps): ReactElement {
  const { data, error } = useQuery<GetAdminJourneysReport>(
    GET_ADMIN_JOURNEYS_REPORT,
    {
      variables: { reportType }
    }
  )

  const embedConfig = {
    reportId: data?.adminJourneysReport?.reportId,
    embedUrl: data?.adminJourneysReport?.embedUrl,
    accessToken: data?.adminJourneysReport?.accessToken,
    type: 'report',
    tokenType: models.TokenType.Embed,
    settings: undefined
  }

  useEffect(() => {
    if (error != null) {
      onError()
    }
  }, [error, onError])

  const eventHandlersMap = new Map([
    ['rendered', onLoad],
    ['error', onError]
  ])

  return (
    <>
      <PowerBIEmbed
        embedConfig={embedConfig}
        eventHandlers={eventHandlersMap}
      />
    </>
  )
}
