import Box from '@mui/material/Box'
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
