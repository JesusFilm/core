import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { ReactElement, useState } from 'react'

import Download2 from '@core/shared/ui/icons/Download2'

import { ExportDialog } from '../FilterDrawer/ExportDialog'

interface ExportEventsButtonProps {
  journeyId: string
  disabled: boolean
}

export function ExportEventsButton({
  journeyId,
  disabled
}: ExportEventsButtonProps): ReactElement {
  const [showExportDialog, setShowExportDialog] = useState(false)

  return (
    <Box sx={{ display: { sm: 'block', md: 'none' } }}>
      <IconButton onClick={() => setShowExportDialog(true)} disabled={disabled}>
        <Download2 />
      </IconButton>
      <ExportDialog
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        journeyId={journeyId}
      />
    </Box>
  )
}
