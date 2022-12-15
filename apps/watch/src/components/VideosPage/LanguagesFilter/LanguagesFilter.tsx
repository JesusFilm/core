import {
  LanguageAutocomplete,
  LanguageAutocompleteProps
} from '@core/shared/ui/LanguageAutocomplete'
import { ReactElement, ReactNode } from 'react'
import { AutocompleteRenderInputParams } from '@mui/material/Autocomplete'
import CircularProgress from '@mui/material/CircularProgress'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

export function LanguagesFilter(
  props: LanguageAutocompleteProps
): ReactElement {
  const renderInput = (params: AutocompleteRenderInputParams): ReactNode => (
    <TextField
      {...params}
      label="Search Languages"
      variant="filled"
      helperText="+2000 languages"
      InputProps={{
        ...params.InputProps,
        sx: { paddingBottom: 2 },
        endAdornment: (
          <>
            {props.loading === true ? (
              <CircularProgress color="inherit" size={20} />
            ) : null}
            {params.InputProps.endAdornment}
          </>
        )
      }}
    />
  )

  return (
    <>
      <Typography>Languages</Typography>
      <LanguageAutocomplete {...props} renderInput={renderInput} />
    </>
  )
}
