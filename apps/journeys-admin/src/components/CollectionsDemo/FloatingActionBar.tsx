import AddIcon from '@mui/icons-material/Add'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import SearchIcon from '@mui/icons-material/Search'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { ReactElement } from 'react'

import type { JourneyStatus } from '../JourneyList/JourneyListView/JourneyListView'
import { JourneySort, SortOrder } from '../JourneyList/JourneySort'
import { JourneyStatusFilter } from '../JourneyList/JourneyStatusFilter'

interface FloatingActionBarProps {
  onAddCollection: () => void
  onToggleHelp: () => void
  searchQuery: string
  onSearchChange: (query: string) => void
  filterStatus: JourneyStatus
  onFilterStatusChange: (status: JourneyStatus) => void
  sortOrder: SortOrder | undefined
  onSortOrderChange: (order: SortOrder) => void
}

export function FloatingActionBar({
  onAddCollection,
  onToggleHelp,
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  sortOrder,
  onSortOrderChange
}: FloatingActionBarProps): ReactElement {
  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
        zIndex: 10,
        borderRadius: '12px 12px 0 0'
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.5}
        sx={{ px: 2, py: 1 }}
      >
        <TextField
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          size="small"
          placeholder="Search templates..."
          aria-label="search templates"
          sx={{ width: 200 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18 }} />
                </InputAdornment>
              )
            }
          }}
        />
        <Button
          size="small"
          variant="text"
          startIcon={<MenuBookIcon sx={{ fontSize: 16 }} />}
          onClick={onToggleHelp}
          sx={{ textTransform: 'none', color: 'text.secondary', flexShrink: 0 }}
        >
          Guide
        </Button>
        <Button
          size="small"
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddCollection}
          aria-label="create new collection"
          sx={{ flexShrink: 0 }}
        >
          Collection
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <JourneyStatusFilter
          status={filterStatus}
          onChange={onFilterStatusChange}
        />
        <JourneySort sortOrder={sortOrder} onChange={onSortOrderChange} />
      </Stack>
    </Box>
  )
}
