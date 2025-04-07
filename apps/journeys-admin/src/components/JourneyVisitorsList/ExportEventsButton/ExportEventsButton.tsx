import IconButton from '@mui/material/IconButton'
import { ReactElement } from 'react'
import { useJourneyEventsExport } from '../../../libs/useJourneyEventsExport'
import { useSnackbar } from 'notistack'
import { GetJourneyEventsVariables } from '../../../../__generated__/GetJourneyEvents'
import CircularProgress from '@mui/material/CircularProgress'
import Download2 from '@core/shared/ui/icons/Download2'
import Box from '@mui/material/Box'

interface ExportEventsButtonProps {
  journeyId: string
}

export function ExportEventsButton({
  journeyId
}: ExportEventsButtonProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const [exportJourneyEvents, { downloading }] = useJourneyEventsExport()

  const handleExport = async (
    input: Pick<GetJourneyEventsVariables, 'journeyId' | 'filter'>
  ): Promise<void> => {
    try {
      await exportJourneyEvents(input)
    } catch (error) {
      enqueueSnackbar(error.message, {
        variant: 'error'
      })
    }
  }

  return (
    <Box sx={{ display: { sm: 'block', md: 'none' } }}>
      {downloading ? (
        <CircularProgress variant="indeterminate" />
      ) : (
        <IconButton onClick={() => handleExport({ journeyId })}>
          <Download2 />
        </IconButton>
      )}
    </Box>
  )
}
