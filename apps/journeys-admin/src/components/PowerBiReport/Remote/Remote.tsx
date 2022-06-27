import { ReactElement } from 'react'
import { EmbedProps, PowerBIEmbed } from 'powerbi-client-react'
import { models } from 'powerbi-client'
import { gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import { JourneysReportType } from '../../../../__generated__/globalTypes'
import { GetAdminJourneysReport } from '../../../../__generated__/GetAdminJourneysReport'

export const GET_ADMIN_JOURNEYS_REPORT = gql`
  query GetAdminJourneysReport($reportType: JourneysReportType!) {
    adminJourneysReport(reportType: $reportType) {
      embedUrl
      accessToken
    }
  }
`
export interface RemoteProps {
  reportType: JourneysReportType
  onLoad: () => void
  onError: () => void
}

export function Remote({
  reportType,
  onLoad,
  onError
}: RemoteProps): ReactElement {
  const { data } = useQuery<GetAdminJourneysReport>(GET_ADMIN_JOURNEYS_REPORT, {
    variables: { reportType },
    onError
  })

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
  return (
    <Box
      data-testid={`powerBi-${reportType}-report`}
      sx={{
        '> div': { height: '100%' }
      }}
    >
      <PowerBIEmbed {...embedProps} />
    </Box>
  )
}
