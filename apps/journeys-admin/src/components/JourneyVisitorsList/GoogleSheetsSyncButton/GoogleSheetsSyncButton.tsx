import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import ArrowRefresh6 from '@core/shared/ui/icons/ArrowRefresh6'

import { Tooltip } from '../../Tooltip/Tooltip'

interface GoogleSheetsSyncButtonProps {
  disabled: boolean
  onSyncClick: () => void
}

export function GoogleSheetsSyncButton({
  disabled,
  onSyncClick
}: GoogleSheetsSyncButtonProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const disabledTooltip = t(
    'Only team members and journey owners can export data.'
  )

  return (
    <Box sx={{ display: { sm: 'block', md: 'none' } }}>
      {disabled ? (
        <Tooltip title={disabledTooltip} placement="bottom">
          <IconButton
            aria-label={`${t('Sync to Google Sheets')} - ${disabledTooltip}`}
            onClick={onSyncClick}
            disabled
          >
            <ArrowRefresh6 />
          </IconButton>
        </Tooltip>
      ) : (
        <IconButton
          aria-label={t('Sync to Google Sheets')}
          onClick={onSyncClick}
        >
          <ArrowRefresh6 />
        </IconButton>
      )}
    </Box>
  )
}
