import TextField, { TextFieldProps } from '@mui/material/TextField'
import { ReactElement } from 'react'

export function ResizableTextField(
  props: Omit<TextFieldProps, 'variant | multiline | sx'>
): ReactElement {
  return (
    <TextField
      {...props}
      variant="outlined"
      multiline
      hiddenLabel
      sx={{
        '.MuiOutlinedInput-root': {
          height: 'fit-content'
        },
        '& .MuiOutlinedInput-input': {
          resize: 'vertical'
        }
      }}
    />
  )
}
