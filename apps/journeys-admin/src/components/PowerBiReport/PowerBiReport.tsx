import { ReactElement, useEffect } from 'react'
import { EmbedProps, PowerBIEmbed } from 'powerbi-client-react'
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

  const embedProps: EmbedProps = {
    embedConfig: {
      embedUrl: data?.adminJourneysReport?.embedUrl,
      accessToken: data?.adminJourneysReport?.accessToken,
      type: 'report',
      tokenType: models.TokenType.Embed,
      settings: {
        filterPaneEnabled: false,
        background: models.BackgroundType.Transparent,
        panes: {
          pageNavigation: {
            visible: false
          }
        }
      }
    },
    eventHandlers: new Map([
      ['rendered', onLoad],
      ['error', onError]
    ])
  }

  useEffect(() => {
    if (error != null) {
      onError()
    }
  }, [error, onError])

  return (
    <>
      <PowerBIEmbed {...embedProps} />
    </>
  )
}
