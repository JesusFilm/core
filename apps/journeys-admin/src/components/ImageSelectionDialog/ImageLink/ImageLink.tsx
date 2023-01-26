import LinkIcon from '@mui/icons-material/Link'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { ReactElement } from 'react'

export function ImageLink(): ReactElement {
  // TODO:
  // upload logic to cloudflare

  return (
    <Stack direction="column" sx={{ pt: 5 }}>
      <TextField
        id="src"
        name="src"
        variant="filled"
        label="Paste URL of image..."
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LinkIcon />
            </InputAdornment>
          )
        }}
      />
    </Stack>
  )
}
