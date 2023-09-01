import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import { ReactElement } from 'react'

export function AIPrompt(): ReactElement {
  return (
    <Box>
      <TextField
        id="outlined-textarea"
        label="Multiline Placeholder"
        placeholder="Placeholder"
        multiline
      />
    </Box>
  )
}
