import { StyledEngineProvider, useTheme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import { ReactElement } from 'react'

interface ResizableTextFieldProps {
  id: string
  name: string
  value: string
  handleChange?: (e: React.ChangeEvent) => void
  error?: boolean
  helperText?: string
  disabled?: boolean
  minRows?: number
  maxRows?: number
}

export function ResizableTextField({
  id,
  name,
  value,
  handleChange,
  error = false,
  helperText,
  disabled = false,
  minRows = 3,
  maxRows = 3
}: ResizableTextFieldProps): ReactElement {
  const theme = useTheme()
  return (
    <StyledEngineProvider injectFirst>
      <TextField
        hiddenLabel
        id={id}
        name={name}
        variant="filled"
        value={value}
        onChange={handleChange}
        error={error}
        helperText={helperText}
        multiline
        minRows={minRows}
        maxRows={maxRows}
        fullWidth
        disabled={disabled}
        sx={{
          '.MuiFilledInput-root': {
            backgroundColor: theme.palette.background.paper
          },
          '& .MuiFilledInput-input': {
            resize: 'vertical'
          }
        }}
      />
    </StyledEngineProvider>
  )
}
