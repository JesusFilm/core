import LaunchIcon from '@mui/icons-material/Launch'
import RefreshIcon from '@mui/icons-material/Refresh'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { format } from 'date-fns'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import Trash2Icon from '@core/shared/ui/icons/Trash2'

import { GoogleSheetsSyncItem } from '../types'
import { getSpreadsheetUrl, getStartedByLabel } from '../libs/googleSheetsSyncUtils'

interface MobileSyncCardProps {
  sync: GoogleSheetsSyncItem
  isHistory?: boolean
  deletingSyncId?: string | null
  backfillingSyncId?: string | null
  onRequestDelete?: (syncId: string) => void
  onBackfill?: (syncId: string) => void
}

export function MobileSyncCard({
  sync,
  isHistory = false,
  deletingSyncId,
  backfillingSyncId,
  onRequestDelete,
  onBackfill
}: MobileSyncCardProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const spreadsheetUrl = getSpreadsheetUrl(sync)
  const createdAtDate = new Date(sync.createdAt)
  const formattedDate = !Number.isNaN(createdAtDate.getTime())
    ? format(createdAtDate, 'yyyy-MM-dd')
    : 'N/A'
  const startedBy = getStartedByLabel(sync)
  const isDeleting = deletingSyncId === sync.id

  return (
    <Box
      sx={{
        p: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Link
          href={spreadsheetUrl ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          underline="always"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            textDecorationColor: 'text.primary'
          }}
          onClick={(e) => {
            if (spreadsheetUrl == null) e.preventDefault()
          }}
        >
          {sync.sheetName ?? sync.spreadsheetId ?? t('Not found')}
          <LaunchIcon sx={{ fontSize: 16 }} />
        </Link>
      </Box>

      <Box>
        <Typography variant="body2">
          <Box component="span" sx={{ fontWeight: 700 }}>
            {t('Sync Start:')}{' '}
          </Box>
          {formattedDate}
        </Typography>
        <Typography variant="body2">
          <Box component="span" sx={{ fontWeight: 700 }}>
            {t('By:')}{' '}
          </Box>
          {startedBy}
        </Typography>
      </Box>

      {!isHistory && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 1
          }}
        >
          <Chip
            label={t('Active')}
            size="small"
            sx={{
              bgcolor: 'rgba(89,195,5,0.2)',
              color: 'success.dark',
              fontWeight: 600
            }}
          />
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip
              title={t('Backfill - Replace all data with fresh export')}
            >
              <IconButton
                onClick={() => onBackfill?.(sync.id)}
                disabled={backfillingSyncId === sync.id || isDeleting}
                size="small"
                aria-label={t('Backfill sync')}
              >
                {backfillingSyncId === sync.id ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <RefreshIcon />
                )}
              </IconButton>
            </Tooltip>
            <IconButton
              onClick={() => onRequestDelete?.(sync.id)}
              disabled={isDeleting || backfillingSyncId === sync.id}
              size="small"
            >
              {isDeleting ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Trash2Icon />
              )}
            </IconButton>
          </Box>
        </Box>
      )}
    </Box>
  )
}
