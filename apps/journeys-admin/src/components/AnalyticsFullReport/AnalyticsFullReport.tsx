import { ReactElement, useState } from 'react'
import { PowerBIEmbed } from 'powerbi-client-react'
import { models } from 'powerbi-client'

export function AnalyticsFullReport(): ReactElement {
  const [embedConfig, setEmbedConfig] =
    useState<models.IReportEmbedConfiguration>({
      type: 'report',
      embedUrl: undefined,
      tokenType: models.TokenType.Embed,
      accessToken: undefined,
      settings: undefined
    })

  return (
    <>
      <div>Full report</div>
      <PowerBIEmbed embedConfig={embedConfig} />
    </>
  )
}
