import dynamic from 'next/dynamic'
import { gql, useQuery } from '@apollo/client'
import { ReactElement } from 'react'
import { JourneysReportType } from '../../../__generated__/globalTypes'
import { GetAdminJourneysReport } from '../../../__generated__/GetAdminJourneysReport'
import { AnalyticsFullReportProps } from './AnalyticsFullReport/AnalyticsFullReport'

const GET_ADMIN_JOURNEYS_REPORT = gql`
  query GetAdminJourneysReport($reportType: JourneysReportType!) {
    adminJourneysReport(reportType: $reportType) {
      reportId
      embedUrl
      accessToken
    }
  }
`

export function JourneysFullReport(): ReactElement {
  const { data, loading, error } = useQuery<GetAdminJourneysReport>(
    GET_ADMIN_JOURNEYS_REPORT,
    {
      variables: { reportType: JourneysReportType.multipleFull }
    }
  )

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
      {data?.adminJourneysReport != null && !loading && error == null ? (
        <AnalyticsFullReport
          reportConfig={{
            reportId: data.adminJourneysReport.reportId,
            embedUrl: data.adminJourneysReport.embedUrl,
            accessToken: data.adminJourneysReport.accessToken
          }}
        />
      ) : (
        <div>{error?.message}</div>
      )}
    </>
  )
}
// <div style={{ visibility: reportLoaded ? undefined : 'hidden' }}>
