import Box from '@mui/material/Box'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ViewList from '@mui/icons-material/ViewList'
import ViewModule from '@mui/icons-material/ViewModule'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { JourneyListMenu } from '../../JourneyListMenu'
import { JourneySort } from '../../JourneySort'
import { JourneyStatusFilter } from '../../JourneyStatusFilter'

import type { SharedControlProps } from './shared'

// Status filter component
export const StatusFilterControl = ({
  selectedStatus,
  handleStatusChange
}: Pick<
  SharedControlProps,
  'selectedStatus' | 'handleStatusChange'
>): ReactElement => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      ml: 'auto',
      mr: 0
    }}
  >
    <JourneyStatusFilter
      status={selectedStatus}
      onChange={handleStatusChange}
    />
  </Box>
)

// Sort component
export const SortControl = ({
  sortOrder,
  setSortOrder
}: Pick<SharedControlProps, 'sortOrder' | 'setSortOrder'>): ReactElement => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      ml: { xs: 1, sm: 0 }
    }}
  >
    <JourneySort sortOrder={sortOrder} onChange={setSortOrder} />
  </Box>
)

export const DisplayControl = ({
  display = 'grid',
  setDisplay
}: Pick<SharedControlProps, 'display' | 'setDisplay'>): ReactElement => {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={display}
      aria-label={t('Journey view')}
      onChange={(_event, value) => {
        if (value != null) setDisplay?.(value)
      }}
      sx={{
        ml: { xs: 1, sm: 0 },
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        p: 0.25,
        '& .MuiToggleButton-root': {
          border: 0,
          borderRadius: 1.5,
          p: 0.75,
          color: 'secondary.light',
          '&.Mui-selected': {
            bgcolor: 'grey.200',
            color: 'secondary.main'
          }
        }
      }}
    >
      <ToggleButton value="grid" aria-label={t('Grid view')}>
        <ViewModule sx={{ fontSize: 18 }} />
      </ToggleButton>
      <ToggleButton value="list" aria-label={t('List view')}>
        <ViewList sx={{ fontSize: 18 }} />
      </ToggleButton>
    </ToggleButtonGroup>
  )
}

// Menu component
export const MenuControl = ({
  setActiveEvent,
  menuMarginRight
}: Pick<SharedControlProps, 'setActiveEvent'> & {
  menuMarginRight?: { xs: number; sm: number }
}): ReactElement => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      ml: { xs: 1, sm: 0 },
      mr: menuMarginRight ?? { xs: 1, sm: -8 }
    }}
  >
    <JourneyListMenu onClick={setActiveEvent} />
  </Box>
)
