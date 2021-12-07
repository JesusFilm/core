import { ReactElement, useState, useEffect } from 'react'
import {
  Box,
  IconButton,
  TextField,
  InputAdornment,
  Alert,
  Snackbar,
  Fade,
  useTheme,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Button,
  Link,
  Typography
} from '@mui/material'
import InsertLinkIcon from '@mui/icons-material/InsertLink'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import EditIcon from '@mui/icons-material/Edit'

export interface ShareSectionProps {
  slug: string
  forceMenu?: boolean // used only for storybook testing
}

const ShareSection = ({ slug, forceMenu }: ShareSectionProps): ReactElement => {
  const journeyLink = `/journeys/${slug}` // update this
  const journeyEditLink = `/journeys/${slug}/edit` // update this
  const [showAlert, setShowAlert] = useState(false)
  const theme = useTheme()
  const [width, setWidth] = useState(window.innerWidth)

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = forceMenu === true ? true : Boolean(anchorEl)

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget)
  }
  const handleCloseMenu = (): void => {
    setAnchorEl(null)
  }

  useEffect(() => {
    const updateWidth = (): void => {
      setWidth(window.innerWidth)
    }
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

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
      {width > theme.breakpoints.values.md ? (
        <>
          <Typography variant="h6" gutterBottom>
            Journey URL
          </Typography>
          <TextField
            id="filled-basic"
            hiddenLabel
            variant="filled"
            value={journeyLink}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconButton>
                    <InsertLinkIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{ width: '334px' }}
          />
          <Box sx={{ display: 'flex' }}>
            <Button
              startIcon={<EditIcon />}
              sx={{ pl: 5, color: theme.palette.primary.main }}
            >
              <Link href={journeyEditLink} color="inherit" underline="none">
                Edit
              </Link>
            </Button>

            <Button
              onClick={handleCopyLink}
              startIcon={<ContentCopyIcon />}
              sx={{ color: theme.palette.primary.main }}
            >
              Copy
            </Button>
          </Box>
        </>
      ) : (
        <Box sx={{ display: 'flex' }}>
          <TextField
            id="filled-basic"
            label="Journey URL"
            variant="filled"
            value={journeyLink}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconButton>
                    <InsertLinkIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{ width: '262px' }}
          />

          <IconButton
            id="journey-actions"
            aria-controls="journey-actions"
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
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
              'aria-labelledby': 'journey-actions'
            }}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
          >
            <Link href={journeyEditLink} color="inherit" underline="none">
              <MenuItem>
                <ListItemIcon>
                  <EditIcon />
                </ListItemIcon>
                <ListItemText>Edit</ListItemText>
              </MenuItem>
            </Link>

            <MenuItem onClick={handleCopyLink}>
              <ListItemIcon>
                <ContentCopyIcon />
              </ListItemIcon>
              <ListItemText>Copy</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      )}

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
            backgroundColor: '#26262E',
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
