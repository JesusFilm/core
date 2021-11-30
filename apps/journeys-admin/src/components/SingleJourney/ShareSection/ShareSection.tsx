import { ReactElement, useState } from 'react'
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Link,
  Alert,
  Snackbar,
  Fade
} from '@mui/material'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import InsertLinkIcon from '@mui/icons-material/InsertLink'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

interface ShareSectionProps {
  slug: string
}

const ShareSection = ({ slug }: ShareSectionProps): ReactElement => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)
  // update link
  const journeyLink = `/journeys/${slug}`
  const [showAlert, setShowAlert] = useState(false)

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget)
  }
  const handleCloseMenu = (): void => {
    setAnchorEl(null)
  }

  const handleCopyLink = async (): Promise<void> => {
    await navigator.clipboard.writeText(journeyLink)
    setShowAlert(true)
  }

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ): void => {
    if (reason === 'clickaway') {
      return
    }
    setShowAlert(false)
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
          <MenuItem onClick={handleCopyLink}>Copy Link</MenuItem>
          {/* Update link */}
          <MenuItem>
            <Link href={`/journeys/${slug}/edit`} underline="none">
              Change Link
            </Link>
          </MenuItem>
        </Menu>
      </Box>

      <TextField
        id="filled-basic"
        fullWidth
        hiddenLabel
        variant="filled"
        value={journeyLink}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <InsertLinkIcon />
            </InputAdornment>
          )
        }}
      />

      <Snackbar
        open={showAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        TransitionComponent={Fade}
        autoHideDuration={5000}
        onClose={handleClose}
      >
        <Alert
          icon={false}
          severity="success"
          action={<CheckCircleIcon sx={{ color: '#5EA10A' }} />}
          sx={{
            width: '286px',
            color: 'white',
            backgroundColor: 'black',
            borderRadius: '2px'
          }}
        >
          Link Copied
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default ShareSection
