import LaunchIcon from '@mui/icons-material/Launch'
import NorthEastIcon from '@mui/icons-material/NorthEast'
import RefreshIcon from '@mui/icons-material/Refresh'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { format } from 'date-fns'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { KeyboardEvent, ReactElement } from 'react'

import Trash2Icon from '@core/shared/ui/icons/Trash2'

import { GoogleSheetsSyncItem } from '../types'
import { getSpreadsheetUrl, getStartedByLabel } from '../libs/googleSheetsSyncUtils'

interface SyncTableProps {
  syncs: GoogleSheetsSyncItem[]
  variant: 'active' | 'history'
  deletingSyncId?: string | null
  backfillingSyncId?: string | null
  onRequestDelete?: (syncId: string) => void
  onBackfill?: (syncId: string) => void
}

export function SyncTable({
  syncs,
  variant,
  deletingSyncId,
  backfillingSyncId,
  onRequestDelete,
  onBackfill
}: SyncTableProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const isActive = variant === 'active'

  function handleOpenSyncRow(sync: GoogleSheetsSyncItem): void {
    const spreadsheetUrl = getSpreadsheetUrl(sync)
    if (spreadsheetUrl == null) {
      enqueueSnackbar(t('Something went wrong, please try again!'), {
        variant: 'error'
      })
      return
    }
    if (typeof window === 'undefined') return
    window.open(spreadsheetUrl, '_blank', 'noopener,noreferrer')
  }

  function handleSyncRowKeyDown(
    event: KeyboardEvent<HTMLTableRowElement>,
    sync: GoogleSheetsSyncItem
  ): void {
    if (event.key === 'Enter') {
      handleOpenSyncRow(sync)
      return
    }
    if (event.key === ' ') {
      event.preventDefault()
      handleOpenSyncRow(sync)
    }
  }

  return (
    <TableContainer
      sx={{
        maxHeight: isActive ? 320 : 240,
        overflowY: 'auto',
        overflowX: 'auto'
      }}
    >
      <Table
        stickyHeader
        size="small"
        aria-label={isActive ? t('Existing syncs') : t('Removed syncs')}
      >
        <TableHead>
          <TableRow>
            <TableCell>{t('Sheet Name')}</TableCell>
            <TableCell sx={{ width: 120 }}>
              {isActive ? t('Sync Start') : t('Removed At')}
            </TableCell>
            <TableCell>{t('Started By')}</TableCell>
            <TableCell sx={{ width: 120 }}>{t('Status')}</TableCell>
            {isActive && (
              <TableCell sx={{ width: 100 }} align="right">
                {t('Actions')}
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {syncs.map((sync) => {
            const dateValue = isActive ? sync.createdAt : sync.deletedAt
            const parsedDate = dateValue != null ? new Date(dateValue) : null
            const formattedDate =
              parsedDate != null && !Number.isNaN(parsedDate.getTime())
                ? format(parsedDate, 'yyyy-MM-dd')
                : 'N/A'
            const startedBy = getStartedByLabel(sync)
            const isDeleting = deletingSyncId === sync.id
            const LinkIcon = isActive ? NorthEastIcon : LaunchIcon

            return (
              <TableRow
                key={sync.id}
                hover
                role="button"
                tabIndex={0}
                aria-label={`${t('Open link in new tab')}: ${
                  sync.sheetName ?? sync.spreadsheetId ?? t('Not found')
                }`}
                onClick={() => handleOpenSyncRow(sync)}
                onKeyDown={(event) => handleSyncRowKeyDown(event, sync)}
                sx={{
                  cursor: 'pointer',
                  '&:focus-visible': {
                    outline: (theme) =>
                      `2px solid ${theme.palette.primary.main}`,
                    outlineOffset: 2
                  }
                }}
              >
                <TableCell width="40%">
                  <Tooltip
                    title={sync.sheetName ?? ''}
                    arrow
                    placement="top"
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        maxWidth: 240
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          textDecoration: 'underline'
                        }}
                      >
                        {sync.sheetName ?? 'N/A'}
                      </Typography>
                      <LinkIcon sx={{ fontSize: 14, flexShrink: 0 }} />
                    </Box>
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ width: 120 }}>{formattedDate}</TableCell>
                <TableCell>{startedBy}</TableCell>
                <TableCell sx={{ width: 120 }}>
                  {isActive ? (
                    <Chip
                      label={t('Active')}
                      color="success"
                      size="small"
                    />
                  ) : (
                    <Chip label={t('Removed')} size="small" />
                  )}
                </TableCell>
                {isActive && (
                  <TableCell sx={{ width: 100 }} align="right">
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 0.5,
                        justifyContent: 'flex-end'
                      }}
                    >
                      <Tooltip
                        title={t(
                          'Backfill - Replace all data with fresh export'
                        )}
                      >
                        <IconButton
                          aria-label={t('Backfill sync')}
                          color="primary"
                          size="small"
                          disabled={
                            backfillingSyncId === sync.id || isDeleting
                          }
                          onClick={(event) => {
                            event.stopPropagation()
                            onBackfill?.(sync.id)
                          }}
                        >
                          {backfillingSyncId === sync.id ? (
                            <CircularProgress
                              size={18}
                              color="inherit"
                              aria-label={t('Backfilling sync')}
                            />
                          ) : (
                            <RefreshIcon sx={{ fontSize: 18 }} />
                          )}
                        </IconButton>
                      </Tooltip>
                      <IconButton
                        aria-label={t('Delete sync')}
                        color="error"
                        size="small"
                        disabled={
                          isDeleting || backfillingSyncId === sync.id
                        }
                        onClick={(event) => {
                          event.stopPropagation()
                          onRequestDelete?.(sync.id)
                        }}
                      >
                        {isDeleting ? (
                          <CircularProgress
                            size={18}
                            color="inherit"
                            aria-label={t('Deleting sync')}
                          />
                        ) : (
                          <Trash2Icon width={18} height={18} />
                        )}
                      </IconButton>
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
