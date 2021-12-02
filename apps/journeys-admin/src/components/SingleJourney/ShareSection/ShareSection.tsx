import { ReactElement, useState } from 'react'
import {
  Box,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Alert,
  Snackbar,
  Fade
} from '@mui/material'
import InsertLinkIcon from '@mui/icons-material/InsertLink'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

interface ShareSectionProps {
  slug: string
}

const ShareSection = ({ slug }: ShareSectionProps): ReactElement => {
  // update link
  const journeyLink = `/journeys/${slug}`
  const [showAlert, setShowAlert] = useState(false)

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
      <Typography variant="h4" gutterBottom={true}>
        Journey Link
      </Typography>

      <TextField
        id="filled-basic"
        fullWidth
        hiddenLabel
        variant="filled"
        value={journeyLink}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IconButton onClick={handleCopyLink}>
                <InsertLinkIcon />
              </IconButton>
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
