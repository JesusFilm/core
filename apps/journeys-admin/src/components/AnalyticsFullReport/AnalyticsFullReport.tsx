import { ReactElement, useState } from 'react'
import { PowerBIEmbed } from 'powerbi-client-react'
import { models } from 'powerbi-client'
import { getPowerBiEmbed } from '@core/nest/powerBi'

export function AnalyticsFullReport(): ReactElement {
  const [embedConfig, setEmbedConfig] =
    useState<models.IReportEmbedConfiguration>({
      type: 'report',
      embedUrl: undefined,
      tokenType: models.TokenType.Embed,
      accessToken: undefined,
      settings: undefined
    })

  const reportConfig = getPowerBiEmbed(
    {
      apiUrl: 'https://api.powerbi.com/',
      authorityUri: 'https://login.microsoftonline.com/common/v2.0',
      clientId: '167a32da-68dd-421f-a075-6e333c0d5d09',
      clientSecret: '0V28Q~BBaNSauuXAqzaD0Vh59dqV2s7EqL5niag0',
      scope: 'https://analysis.windows.net/powerbi/api',
      tenantId: '149cd8c2-5d4a-4dfa-8563-f5c0708c5eef',
      workspaceId: '180ff7df-efa8-452b-bf76-487506308a75'
    },
    '26f7b2bf-e6de-4ccc-847e-2fe62acdd880',
    'test-user-id'
  )

  console.log(reportConfig)

  return (
    <>
      <div>Full report</div>
      <PowerBIEmbed embedConfig={embedConfig} />
    </>
  )
}
