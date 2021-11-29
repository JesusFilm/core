import { ReactElement, useState } from 'react'
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  TextField
} from '@mui/material'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'

interface ShareSectionProps {
  slug: string
}

const ShareSection = ({ slug }: ShareSectionProps): ReactElement => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget)
  }
  const handleCloseMenu = (): void => {
    setAnchorEl(null)
  }

  return (
    <Box>
      <Typography variant="h4">Journey Link</Typography>

      <IconButton
        id="share-actions"
        aria-controls="share-actions"
        aria-haspopup="true"
        aria-expanded={open ? 'true' : 'false'}
        onClick={handleOpenMenu}
      >
        <MoreHorizIcon />
      </IconButton>

      <Menu
        id="journey-actions"
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseMenu}
        MenuListProps={{
          'aria-labelledby': 'share-actions'
        }}
      >
        <MenuItem>Copy Link</MenuItem>
        <MenuItem>Change Link</MenuItem>
      </Menu>

      <TextField
        id="filled-basic"
        disabled
        variant="filled"
        value={`journeys/${slug}`}
        size="small"
        sx={{ color: 'black' }}
      />
    </Box>
  )
}

export default ShareSection
