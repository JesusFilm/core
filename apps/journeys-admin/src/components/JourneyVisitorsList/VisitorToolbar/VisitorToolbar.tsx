import { ReactElement, useState } from 'react'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded'
import Box from '@mui/material/Box'
import { FilterDrawer } from '../FilterDrawer/FilterDrawer'

interface VisitorProps {
  handleChange?: (e) => void
  handleClearAll?: () => void
  sortSetting: string
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
    <>
      <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
        <IconButton id="filterIcon">
          <FilterListRoundedIcon onClick={handleOpen} />
        </IconButton>
        <Drawer
          anchor="bottom"
          open={open}
          onClose={handleClose}
          variant="persistent"
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
      {/* CSV download */}
    </>
  )
}
