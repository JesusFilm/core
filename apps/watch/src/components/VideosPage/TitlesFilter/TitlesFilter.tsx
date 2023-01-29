import {
  TitleAutocomplete,
  TitleAutocompleteProps
} from '@core/shared/ui/TitleAutocomplete'
import { ReactElement, ReactNode } from 'react'
import { AutocompleteRenderInputParams } from '@mui/material/Autocomplete'
import CircularProgress from '@mui/material/CircularProgress'
import TextField from '@mui/material/TextField'

export function TitlesFilter(props: TitleAutocompleteProps): ReactElement {
  const renderInput = (params: AutocompleteRenderInputParams): ReactNode => (
    <TextField
      {...params}
      label="Search Titles"
      variant="outlined"
      helperText="+724 titles"
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

  return <TitleAutocomplete {...props} renderInput={renderInput} />
}
