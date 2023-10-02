import { TextInputProps } from '@formium/react/dist/inputs'
import TextField from '@mui/material/TextField'
import { ReactElement } from 'react'

/*
This component is used to render the following fields from formium:
Short Answer, URL, Email
*/

export function TextInput(props: TextInputProps): ReactElement {
  return (
    <TextField
      variant="filled"
      fullWidth
      hiddenLabel
      {...props}
    />
  )
}
