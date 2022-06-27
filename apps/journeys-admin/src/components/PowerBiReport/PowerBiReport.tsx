import { ReactElement, useState } from 'react'
import dynamic from 'next/dynamic'
import { useSnackbar } from 'notistack'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { JourneysReportType } from '../../../__generated__/globalTypes'
import { RemoteProps } from './Remote/Remote'

interface PowerBiReportProps {
  reportType: JourneysReportType
}
export function PowerBiReport({
  reportType
}: PowerBiReportProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  // const containerHeight =
  //   reportType === JourneysReportType.multipleFull ||
  //   reportType === JourneysReportType.singleFull
  //     ? '93vh'
  //     : '30vh'

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
      {!loaded && (
        <Box
          sx={{
            height: 190,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Typography variant="overline" color="secondary.light">
            {error
              ? 'There was an error loading the report'
              : 'The analytics are loading...'}
          </Typography>
        </Box>
      )}
      <Box
        sx={{
          visibility: loaded && !error ? undefined : 'hidden',
          '> div': { height: '100%' }
        }}
      >
        <Remote reportType={reportType} onLoad={onLoad} onError={onError} />
      </Box>
    </>
  )
}
