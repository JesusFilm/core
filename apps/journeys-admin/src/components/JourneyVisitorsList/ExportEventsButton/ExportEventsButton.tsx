import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import Download2 from '@core/shared/ui/icons/Download2'

import { GetJourneyEventsVariables } from '../../../../__generated__/GetJourneyEvents'
import { useJourneyEventsExport } from '../../../libs/useJourneyEventsExport'

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
        <Box sx={{ p: 2 }}>
          <CircularProgress variant="indeterminate" size={24} />
        </Box>
      ) : (
        <IconButton onClick={() => handleExport({ journeyId })}>
          <Download2 />
        </IconButton>
      )}
    </Box>
  )
}
