import { useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { ReactElement, useState } from 'react'

import Download2 from '@core/shared/ui/icons/Download2'

import { ExportDialog } from '../FilterDrawer/ExportDialog'
import { GET_JOURNEY_BLOCK_TYPENAMES } from '../FilterDrawer/FilterDrawer'

export { GET_JOURNEY_BLOCK_TYPENAMES } from '../FilterDrawer/FilterDrawer'

interface ExportEventsButtonProps {
  journeyId: string
  disabled: boolean
}

export function ExportEventsButton({
  journeyId,
  disabled
}: ExportEventsButtonProps): ReactElement {
  const [showExportDialog, setShowExportDialog] = useState(false)
  const { data } = useQuery(GET_JOURNEY_BLOCK_TYPENAMES, {
    variables: { id: journeyId }
  })
  const availableBlockTypes: string[] = data?.journey?.blockTypenames ?? []
  const rawCreatedAt = data?.journey?.createdAt
  const createdAt =
    typeof rawCreatedAt === 'string'
      ? rawCreatedAt
      : rawCreatedAt instanceof Date
        ? rawCreatedAt.toISOString()
        : null

  return (
    <Box sx={{ display: { sm: 'block', md: 'none' } }}>
      <IconButton onClick={() => setShowExportDialog(true)} disabled={disabled}>
        <Download2 />
      </IconButton>
      <ExportDialog
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        journeyId={journeyId}
        availableBlockTypes={availableBlockTypes}
        createdAt={createdAt}
      />
    </Box>
  )
}
