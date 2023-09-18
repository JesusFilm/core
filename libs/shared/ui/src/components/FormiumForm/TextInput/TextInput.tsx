import { TextInputProps } from '@formium/react/dist/inputs'
import TextField from '@mui/material/TextField'
import { ReactElement } from 'react'

export function TextInput(props: TextInputProps): ReactElement {
  return <TextField variant="outlined" fullWidth {...props} />
}
