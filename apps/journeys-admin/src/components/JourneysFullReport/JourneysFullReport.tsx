import dynamic from 'next/dynamic'
import { ReactElement, useState } from 'react'
import { JourneysReportType } from '../../../__generated__/globalTypes'
import { AnalyticsFullReportProps } from './AnalyticsFullReport/AnalyticsFullReport'

export function JourneysFullReport(): ReactElement {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  function onLoad(): void {
    setLoaded(true)
  }

  function onError(): void {
    setError(true)
  }

  // powerbi needs dynamic import, see issue: https://github.com/microsoft/powerbi-client-react/issues/65
  const AnalyticsFullReport = dynamic<AnalyticsFullReportProps>(
    async () =>
      await import(
        /* webpackChunkName: "DynamicAnalyticsFullReport" */
        './AnalyticsFullReport'
      ).then((res) => res.AnalyticsFullReport),
    { ssr: false }
  )

  return (
    <>
      {!loaded && !error && <div>Loading...</div>}
      {error && <div>Error</div>}
      <div style={{ visibility: loaded && !error ? undefined : 'hidden' }}>
        <AnalyticsFullReport
          reportType={JourneysReportType.multipleFull}
          onLoad={onLoad}
          onError={onError}
        />
      </div>
    </>
  )
}
