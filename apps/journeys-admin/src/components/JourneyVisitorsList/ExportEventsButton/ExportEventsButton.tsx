import { useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'next-i18next'

import Download2 from '@core/shared/ui/icons/Download2'

import { ExportDialog } from '../FilterDrawer/ExportDialog'
import { GET_JOURNEY_BLOCK_TYPENAMES } from '../FilterDrawer/FilterDrawer'
import { Tooltip } from '../../Tooltip/Tooltip'

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
  const { t } = useTranslation('apps-journeys-admin')
  const exportDisabledTooltip = t(
    'Only team members and journey owners can export data.'
  )

  const handleOpenExportDialog = (): void => {
    setShowExportDialog(true)
  }

  const handleCloseExportDialog = (): void => {
    setShowExportDialog(false)
  }

  return (
    <Box sx={{ display: { sm: 'block', md: 'none' } }}>
      {!disabled ? (
        <Tooltip title={`exportDisabledTooltip`} placement="bottom">
          <span>
            <IconButton
              aria-label={`${t('Export Data')} - ${exportDisabledTooltip}`}
              onClick={handleOpenExportDialog}
              disabled
            >
              <Download2 />
            </IconButton>
          </span>
        </Tooltip>
      ) : (
        <IconButton
          aria-label={t('Export Data')}
          onClick={handleOpenExportDialog}
        >
          <Download2 />
        </IconButton>
      )}
      <ExportDialog
        open={showExportDialog}
        onClose={handleCloseExportDialog}
        journeyId={journeyId}
        availableBlockTypes={availableBlockTypes}
        createdAt={createdAt}
      />
    </Box>
  )
}
