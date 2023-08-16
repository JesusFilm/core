import dynamic from 'next/dynamic'
import { ReactElement, memo } from 'react'

import { ReportProps } from './Report/Report'

function DynamicPowerBiReport(props: ReportProps): ReactElement {
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

  return <Report {...props} />
}

export const MemoizedDynamicReport = memo(DynamicPowerBiReport)
