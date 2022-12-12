import { ReactElement, useMemo } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'

export interface Language {
  id: string
  name: Translation[]
}

export interface Translation {
  value: string
  primary: boolean
}

export interface LanguageOption {
  id: string
  localName?: string
  nativeName?: string
}

interface LanguageAutocompleteProps {
  onChange: (value?: LanguageOption) => void
  value?: LanguageOption
  languages?: Language[]
  loading: boolean
}

export function LanguageAutocomplete({
  onChange: handleChange,
  value,
  languages,
  loading
}: LanguageAutocompleteProps): ReactElement {
  const options = useMemo(() => {
    return (
      languages?.map(({ id, name }) => {
        const localLanguageName = name.find(({ primary }) => !primary)?.value
        const nativeLanguageName = name.find(({ primary }) => primary)?.value

        return {
          id: id,
          localName: localLanguageName,
          nativeName: nativeLanguageName
        }
      }) ?? []
    )
  }, [languages])

  const sortedOptions = useMemo(() => {
    if (options.length > 0) {
      return options.sort((a, b) => {
        return (a.localName ?? a.nativeName ?? '').localeCompare(
          b.localName ?? b.nativeName ?? ''
        )
      })
    }
    return []
  }, [options])

  return (
    <Autocomplete
      disableClearable
      value={value}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      getOptionLabel={({ localName, nativeName }) =>
        localName ?? nativeName ?? ''
      }
      onChange={(_event, option) => handleChange(option)}
      options={sortedOptions}
      loading={loading}
      disablePortal={process.env.NODE_ENV === 'test'}
      renderInput={(params) => (
        <TextField
          {...params}
          hiddenLabel
          placeholder="Search Language"
          variant="filled"
          InputProps={{
            ...params.InputProps,
            sx: { paddingBottom: 2 },
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            )
          }}
        />
      )}
      renderOption={(props, { localName, nativeName }) => {
        return (
          <li {...props}>
            <Stack>
              <Typography>{localName ?? nativeName}</Typography>
              {localName != null && nativeName != null && (
                <Typography variant="body2" color="text.secondary">
                  {nativeName}
                </Typography>
              )}
            </Stack>
          </li>
        )
      }}
    />
  )
}
