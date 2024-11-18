import { StyledEngineProvider } from '@mui/material/styles'
import { ReactElement } from 'react'
import { TextField, TextFieldProps } from '@mui/material'

export function ResizableTextField(
  props: Omit<TextFieldProps, 'variant | multiline | sx'>
): ReactElement {
  return (
    <StyledEngineProvider injectFirst>
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
    </StyledEngineProvider>
  )
}
