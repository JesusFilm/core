import { ReactElement, useState } from 'react'
import { EmbedProps, PowerBIEmbed } from 'powerbi-client-react'
import { models } from 'powerbi-client'
import { gql, useQuery } from '@apollo/client'
import { useSnackbar } from 'notistack'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Fade from '@mui/material/Fade'
import { JourneysReportType } from '../../../../__generated__/globalTypes'
import { GetAdminJourneysReport } from '../../../../__generated__/GetAdminJourneysReport'

export const GET_ADMIN_JOURNEYS_REPORT = gql`
  query GetAdminJourneysReport($reportType: JourneysReportType!) {
    adminJourneysReport(reportType: $reportType) {
      embedUrl
      accessToken
    }
  }
`
export interface ReportProps {
  reportType: JourneysReportType
}

export function Report({ reportType }: ReportProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  const { data } = useQuery<GetAdminJourneysReport>(GET_ADMIN_JOURNEYS_REPORT, {
    variables: { reportType },
    onError
  })

  function onLoad(): void {
    setLoaded(true)
  }

  function onError(): void {
    setError(true)
    enqueueSnackbar('Error loading report', {
      variant: 'error',
      preventDuplicate: true
    })
  }

  const embedProps: EmbedProps = {
    embedConfig: {
      embedUrl: data?.adminJourneysReport?.embedUrl,
      accessToken: data?.adminJourneysReport?.accessToken,
      type: 'report',
      tokenType: models.TokenType.Embed,
      settings: {
        filterPaneEnabled: false,
        background: models.BackgroundType.Transparent,
        panes: {
          pageNavigation: {
            visible: false
          }
        }
      }
    },
    eventHandlers: new Map([
      ['rendered', onLoad],
      ['error', onError]
    ])
  }
  return (
    <>
      <Box
        data-testid={`powerBi-${reportType}-report`}
        sx={{
          height: '100%',
          position: 'relative',
          '> div': {
            height: '100%',
            '> iframe': {
              border: 0,
              // negative margin added to remove unknown margin from the iframe that causes scroll bar to appear
              marginBottom: '-6px'
            }
          }
        }}
      >
        <Fade in={!loaded}>
          <Box
            sx={{
              justifyContent: 'center',
              alignItems: 'center',
              display: loaded ? 'none' : 'flex',
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              background: (theme) => theme.palette.background.default
            }}
          >
            <Typography variant="overline" color="secondary.light">
              {error
                ? 'There was an error loading the report'
                : 'The report is loading...'}
            </Typography>
          </Box>
        </Fade>
        {data != null && <PowerBIEmbed {...embedProps} />}
      </Box>
    </>
  )
}
