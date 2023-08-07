import { AutocompleteRenderInputParams } from '@mui/material/Autocomplete'
import CircularProgress from '@mui/material/CircularProgress'
import TextField from '@mui/material/TextField'
import { ReactElement, ReactNode } from 'react'

import {
  LanguageAutocomplete,
  LanguageAutocompleteProps
} from '@core/shared/ui/LanguageAutocomplete'

export function LanguagesFilter(
  props: LanguageAutocompleteProps
): ReactElement {
  const renderInput = (params: AutocompleteRenderInputParams): ReactNode => (
    <TextField
      {...params}
      label="Search Languages"
      variant="outlined"
      helperText={
        props.helperText !== undefined ? props.helperText : '2000+ languages'
      }
      InputProps={{
        ...params.InputProps,
        sx: { paddingBottom: 2 },
        endAdornment: (
          <>
            {props.loading ? (
              <CircularProgress color="inherit" size={20} />
            ) : null}
            {params.InputProps.endAdornment}
          </>
        )
      }}
    />
  )

  return <LanguageAutocomplete {...props} renderInput={renderInput} />
}
