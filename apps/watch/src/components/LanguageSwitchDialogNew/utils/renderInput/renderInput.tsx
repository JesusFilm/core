// Custom renderInput for all selects
import { AutocompleteRenderInputParams } from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'

export const renderInput =
  (helperText?: string) => (params: AutocompleteRenderInputParams) => (
    <TextField
      {...params}
      hiddenLabel
      variant="filled"
      helperText={helperText}
      data-testid="LanguageSwitchDialog-Select"
      sx={{
        '& .MuiInputBase-input': {
          fontSize: '0.875rem',
          fontWeight: 600,
          fontFamily: 'Montserrat, ui-sans-serif, system-ui, sans-serif'
        },
        '& .MuiFormHelperText-root': {
          fontFamily: 'Montserrat, ui-sans-serif, system-ui, sans-serif'
        }
      }}
    />
  )
