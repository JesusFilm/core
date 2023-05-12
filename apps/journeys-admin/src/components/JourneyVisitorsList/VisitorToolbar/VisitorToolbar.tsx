import { ReactElement, useState } from 'react'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded'
import Box from '@mui/material/Box'
import { FilterDrawer } from '../FilterDrawer'

export function VisitorToolbar(): ReactElement {
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
        <IconButton>
          <FilterListRoundedIcon onClick={handleOpen} />
        </IconButton>
        <Drawer anchor="bottom" open={open} onClose={handleClose}>
          <FilterDrawer handleClose={handleClose} />
        </Drawer>
      </Box>
      {/* CSV download */}
    </>
  )
}
