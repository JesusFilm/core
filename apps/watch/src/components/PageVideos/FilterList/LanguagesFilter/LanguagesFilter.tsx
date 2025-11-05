import { AutocompleteRenderInputParams } from '@mui/material/Autocomplete'
import CircularProgress from '@mui/material/CircularProgress'
import ListItem from '@mui/material/ListItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { ReactElement, ReactNode } from 'react'
import type { ListChildComponentProps as RowComponentProps } from 'react-window'

import {
  LanguageAutocomplete,
  LanguageAutocompleteProps
} from '@core/shared/ui/LanguageAutocomplete'
import { ResizeObserverPolyfill } from '@core/shared/ui/ResizeObserverPolyfill'

export function Option(props: RowComponentProps<{ rows: any[] }>): ReactNode {
  const { data: rows, index, style } = props
  const { id, localName, nativeName } = rows[index][1]
  const { key, ...optionProps } = rows[index][0]

  return (
    <ListItem
      {...optionProps}
      key={id}
      style={style}
      tabIndex={1}
      sx={{ cursor: 'pointer' }}
    >
      <Stack>
        <Typography variant="h6">{localName ?? nativeName}</Typography>
        {localName != null && nativeName != null && (
          <Typography variant="h6" color="text.secondary">
            {nativeName}
          </Typography>
        )}
      </Stack>
    </ListItem>
  )
}

export function LanguagesFilter(
  props: LanguageAutocompleteProps
): ReactElement {
  const Input = (params: AutocompleteRenderInputParams): ReactNode => (
    <TextField
      {...params}
      label="Search Languages"
      variant="outlined"
      helperText={
        props.helperText !== undefined ? props.helperText : '2000+ languages'
      }
      slotProps={{
        input: {
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
        }
      }}
      data-testid="LanguagesFilter"
    />
  )

  return (
    <>
      <ResizeObserverPolyfill />
      <LanguageAutocomplete
        {...props}
        renderInput={Input}
        renderOption={Option}
      />
    </>
  )
}
