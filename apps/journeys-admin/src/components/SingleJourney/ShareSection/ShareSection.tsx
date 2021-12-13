import { ReactElement, useState } from 'react'
import {
  Box,
  IconButton,
  TextField,
  InputAdornment,
  Alert,
  Snackbar,
  Fade,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Button,
  Typography
} from '@mui/material'
import Link from 'next/link'
import InsertLinkIcon from '@mui/icons-material/InsertLink'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import EditIcon from '@mui/icons-material/Edit'
import { useBreakpoints } from '@core/shared/ui'

export interface ShareSectionProps {
  slug: string
  forceMenu?: boolean // used only for storybook testing
}

export function ShareSection({
  slug,
  forceMenu
}: ShareSectionProps): ReactElement {
  const journeyLink = `https://your.nextstep.is/${slug}`
  const journeyEditLink = `/journeys/${slug}/edit`
  const breakpoints = useBreakpoints()

  const [showAlert, setShowAlert] = useState(false)

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = forceMenu === true ? true : Boolean(anchorEl)

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
      {breakpoints.sm ? (
        <>
          <Typography variant="subtitle2" sx={{ pl: 6 }}>
            Journey URL
          </Typography>
          <TextField
            id="filled-basic"
            hiddenLabel
            variant="filled"
            fullWidth
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
            sx={{ px: 6, pt: 6 }}
          />
          <Box sx={{ display: 'flex', pl: 6 }}>
            <Link href={journeyEditLink} passHref>
              <Button
                startIcon={<EditIcon />}
                sx={{
                  color: (theme) => theme.palette.primary.main,
                  fontWeight: 600,
                  fontSize: '14px',
                  lineHeight: 4
                }}
              >
                Edit
              </Button>
            </Link>

            <Button
              onClick={handleCopyLink}
              startIcon={<ContentCopyIcon />}
              sx={{
                color: (theme) => theme.palette.primary.main,
                pl: 7,
                fontWeight: 600,
                fontSize: '14px',
                lineHeight: 4
              }}
            >
              Copy
            </Button>
          </Box>
        </>
      ) : (
        <Box sx={{ display: 'flex', pl: 6 }}>
          <TextField
            id="filled-basic"
            label="Journey URL"
            variant="filled"
            fullWidth
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
          />

          <IconButton
            id="journey-actions"
            aria-controls="journey-actions"
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleOpenMenu}
            sx={{ pl: 3, pr: 6 }}
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
            <Link href={journeyEditLink} passHref>
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
