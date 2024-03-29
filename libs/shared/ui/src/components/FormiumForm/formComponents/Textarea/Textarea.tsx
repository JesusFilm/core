import { TextareaProps } from '@formium/react/dist/inputs'
import TextField from '@mui/material/TextField'
import { ReactElement } from 'react'

export function Textarea(props: TextareaProps): ReactElement {
  return (
    <TextField
      variant="filled"
      fullWidth
      multiline
      hiddenLabel
      {...props}
      rows={3}
    />
  )
}
