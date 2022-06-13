import { ReactElement } from 'react'
import { JourneysReportType } from '../../../__generated__/globalTypes'
import { AnalyticsFullReport } from './AnalyticsFullReport'

export function JourneysFullReport(): ReactElement {
  return <AnalyticsFullReport reportType={JourneysReportType.multipleFull} />
}

// powerbi needs dynamic import, see issue: https://github.com/microsoft/powerbi-client-react/issues/65
// const AnalyticsFullReport = dynamic<AnalyticsFullReportProps>(
//   async () =>
//     await import(
//       /* webpackChunkName: "DynamicAnalyticsFullReport" */
//       '../../src/components/AnalyticsFullReport'
//     ).then((res) => res.AnalyticsFullReport),
//   { ssr: false }
// )
