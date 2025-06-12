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
    />
  )
