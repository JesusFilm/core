import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import { MenuControl, SortControl, StatusFilterControl } from '../Controls'
import type { SharedModeProps } from '../shared'

export interface SharedWithMeModeProps extends SharedModeProps {}

export const SharedWithMeMode = ({
  selectedStatus,
  handleStatusChange,
  sortOrder,
  setSortOrder,
  setActiveEvent,
  renderList
}: SharedWithMeModeProps): ReactElement => (
  <>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        pr: 2,
        overflow: 'visible'
      }}
      data-testid="journey-list-view"
    >
      <StatusFilterControl
        selectedStatus={selectedStatus}
        handleStatusChange={handleStatusChange}
      />
      <SortControl sortOrder={sortOrder} setSortOrder={setSortOrder} />
      <MenuControl setActiveEvent={setActiveEvent} />
    </Box>
    {/* Journeys content - rendered directly without TabPanel */}
    {renderList('journeys', selectedStatus)}
  </>
)
