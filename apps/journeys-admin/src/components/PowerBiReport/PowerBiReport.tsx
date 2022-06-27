import { ReactElement, useState } from 'react'
import dynamic from 'next/dynamic'
import { useSnackbar } from 'notistack'
import Box from '@mui/material/Box'
import { JourneysReportType } from '../../../__generated__/globalTypes'
import { RemoteProps } from './Remote/Remote'
import { ReportSkeleton } from './ReportSkeleton'

interface PowerBiReportProps {
  reportType: JourneysReportType
}
export function PowerBiReport({
  reportType
}: PowerBiReportProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  function onLoad(): void {
    setLoaded(true)
  }

  function onError(): void {
    setError(true)
    enqueueSnackbar('Error loading Analytics', {
      variant: 'error',
      preventDuplicate: true
    })
  }

  // powerbi needs dynamic import, see issue: https://github.com/microsoft/powerbi-client-react/issues/65
  const Remote = dynamic<RemoteProps>(
    async () =>
      await import(
        /* webpackChunkName: "DynamicRemote" */
        './Remote'
      ).then((res) => res.Remote),
    { ssr: false }
  )

  return (
    <>
      {!loaded && !error && (
        <ReportSkeleton message={'The analytics are loading...'} />
      )}
      {error && (
        <ReportSkeleton message={'There was an error loading the report'} />
      )}
      <div style={{ visibility: loaded && !error ? undefined : 'hidden' }}>
        <Box
          sx={{
            height: loaded && !error ? '93vh' : '0',
            '> div': { height: '100%' }
          }}
        >
          <Remote reportType={reportType} onLoad={onLoad} onError={onError} />
        </Box>
      </div>
    </>
  )
}
