import Box from '@mui/material/Box'
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
  const [exportJourneyEvents] = useJourneyEventsExport()

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
      <IconButton onClick={() => handleExport({ journeyId })}>
        <Download2 />
      </IconButton>
    </Box>
  )
}
