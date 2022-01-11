import { ReactElement, useState } from 'react'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import Fade from '@mui/material/Fade'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import InsertLinkIcon from '@mui/icons-material/InsertLink'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
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
      {breakpoints.md ? (
        <Stack spacing={6} direction="column">
          <Typography variant="subtitle2">Journey URL</Typography>
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
          />
          <Stack spacing={8} direction="row">
            <Button
              size="small"
              onClick={handleCopyLink}
              startIcon={<ContentCopyIcon />}
            >
              Copy
            </Button>
          </Stack>
        </Stack>
      ) : (
        <Box sx={{ display: 'flex' }}>
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
            sx={{ pl: 3 }}
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
          >
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
          action={<CheckCircleIcon color="success" />}
          sx={{
            width: '286px',
            color: 'primary.contrastText',
            backgroundColor: 'secondary.dark',
            borderRadius: '2px'
          }}
        >
          Link Copied
        </Alert>
      </Snackbar>
    </Box>
  )
}
