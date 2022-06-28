import { ReactElement } from 'react'
import dynamic from 'next/dynamic'
import { JourneysReportType } from '../../../__generated__/globalTypes'
import { ReportProps } from './Report/Report'

interface DynamicPowerBiReportProps {
  reportType: JourneysReportType
}
export function DynamicPowerBiReport({
  reportType
}: DynamicPowerBiReportProps): ReactElement {
  // PowerBI needs dynamic import
  // See issue: https://github.com/microsoft/powerbi-client-react/issues/65
  const Report = dynamic<ReportProps>(
    async () =>
      await import(
        /* webpackChunkName: "DynamicReport" */
        './Report'
      ).then(({ Report }) => Report),
    { ssr: false }
  )

  return <Report reportType={reportType} />
}
