import { ReactElement, useState } from 'react'
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Link
} from '@mui/material'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import InsertLinkIcon from '@mui/icons-material/InsertLink'

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
      <Box sx={{ display: 'flex' }}>
        <Typography variant="h4">Journey Link</Typography>

        <IconButton
          id="share-actions"
          aria-controls="share-actions"
          aria-haspopup="true"
          aria-expanded={open ? 'true' : 'false'}
          onClick={handleOpenMenu}
          sx={{ marginLeft: 'auto' }}
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
          <Link href="#" underline="none">
            <MenuItem>Copy Link</MenuItem>
          </Link>
          <Link href="#" underline="none">
            <MenuItem>Change Link</MenuItem>
          </Link>
        </Menu>
      </Box>

      <TextField
        id="filled-basic"
        disabled
        fullWidth
        hiddenLabel
        variant="filled"
        value={`journeys/${slug}`}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <InsertLinkIcon />
            </InputAdornment>
          )
        }}
      />
    </Box>
  )
}

export default ShareSection
