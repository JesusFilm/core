import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded' // icon-replace: add filter
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import { ReactElement, useState } from 'react'

import { FilterDrawer } from '../FilterDrawer/FilterDrawer'

interface VisitorProps {
  handleChange?: (e) => void
  handleClearAll?: () => void
  sortSetting?: 'date' | 'duration'
  chatStarted: boolean
  withPollAnswers: boolean
  withSubmittedText: boolean
  withIcon: boolean
  hideInteractive: boolean
}

export function VisitorToolbar({
  handleChange,
  handleClearAll,
  sortSetting,
  chatStarted,
  withPollAnswers,
  withSubmittedText,
  withIcon,
  hideInteractive
}: VisitorProps): ReactElement {
  const [open, setOpen] = useState(false)
  function handleOpen(): void {
    setOpen(true)
  }
  function handleClose(): void {
    setOpen(false)
  }

  return (
    <Box sx={{ display: { sm: 'block', md: 'none' } }}>
      <IconButton>
        <FilterListRoundedIcon onClick={handleOpen} />
      </IconButton>
      <Drawer
        anchor="bottom"
        open={open}
        onClose={handleClose}
        variant="persistent"
        data-testid="filterDrawer"
      >
        <FilterDrawer
          handleClose={handleClose}
          handleChange={handleChange}
          handleClearAll={handleClearAll}
          sortSetting={sortSetting}
          chatStarted={chatStarted}
          withPollAnswers={withPollAnswers}
          withSubmittedText={withSubmittedText}
          withIcon={withIcon}
          hideInteractive={hideInteractive}
        />
      </Drawer>
    </Box>
  )
}
