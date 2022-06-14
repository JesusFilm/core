import { ReactElement } from 'react'
import { PowerBIEmbed } from 'powerbi-client-react'
import { models } from 'powerbi-client'

export interface AnalyticsFullReportProps {
  reportConfig: ReportConfig
}

interface ReportConfig {
  reportId: string
  embedUrl: string
  accessToken: string
}

export function AnalyticsFullReport({
  reportConfig
}: AnalyticsFullReportProps): ReactElement {
  const embedConfig = {
    ...reportConfig,
    type: 'report',
    tokenType: models.TokenType.Embed,
    settings: undefined
  }

  // const eventHandlersMap = new Map([
  //   ['loaded', onLoaded],
  //   ['error', onError]
  // ])

  return (
    <>
      <div>Report</div>
      <PowerBIEmbed
        embedConfig={embedConfig}
        // eventHandlers={eventHandlersMap}
      />
    </>
  )
}
