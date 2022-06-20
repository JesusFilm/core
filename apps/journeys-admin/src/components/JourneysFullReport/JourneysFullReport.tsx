import dynamic from 'next/dynamic'
import { ReactElement, useState } from 'react'
import Box from '@mui/material/Box'
import { useSnackbar } from 'notistack'
import { JourneysReportType } from '../../../__generated__/globalTypes'
import { PowerBiReportProps } from '../PowerBiReport/PowerBiReport'
import { ReportSkeleton } from '../PowerBiReport/ReportSkeleton'

export function JourneysFullReport(): ReactElement {
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
  const PowerBiReport = dynamic<PowerBiReportProps>(
    async () =>
      await import(
        /* webpackChunkName: "DynamicPowerBiReport" */
        '../PowerBiReport'
      ).then((res) => res.PowerBiReport),
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
          <PowerBiReport
            reportType={JourneysReportType.multipleFull}
            onLoad={onLoad}
            onError={onError}
          />
        </Box>
      </div>
    </>
  )
}
