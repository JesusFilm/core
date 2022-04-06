import Box from '@mui/material/Box'
import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'

interface SocialShareAppearanceProps {
  id: string
}

export function SocialShareAppearance({
  id
}: SocialShareAppearanceProps): ReactElement {
  return (
    <Box sx={{ px: 6, py: 4 }}>
      <Typography variant="subtitle2">Social Image</Typography>
      {/* Image */}
      <TextField />
      <TextField />
      <Typography variant="subitle2">Share Preview</Typography>
      <Box>
        <Button>Facebook</Button>
        <Button>Twitter</Button>
      </Box>
    </Box>
  )
}
