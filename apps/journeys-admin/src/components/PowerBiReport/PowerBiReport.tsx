import { ReactElement } from 'react'
import dynamic from 'next/dynamic'
import { JourneysReportType } from '../../../__generated__/globalTypes'
import { RemoteProps } from './Remote/Remote'

interface PowerBiReportProps {
  reportType: JourneysReportType
}
export function PowerBiReport({
  reportType
}: PowerBiReportProps): ReactElement {
  // PowerBI needs dynamic import
  // See issue: https://github.com/microsoft/powerbi-client-react/issues/65
  const Remote = dynamic<RemoteProps>(
    async () =>
      await import(
        /* webpackChunkName: "DynamicRemote" */
        './Remote'
      ).then(({ Remote }) => Remote),
    { ssr: false }
  )

  return <Remote reportType={reportType} />
}
