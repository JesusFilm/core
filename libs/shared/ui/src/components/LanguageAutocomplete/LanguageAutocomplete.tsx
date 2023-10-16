import Autocomplete, {
  AutocompleteRenderInputParams
} from '@mui/material/Autocomplete'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { HTMLAttributes, ReactElement, ReactNode, useMemo } from 'react'

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

export interface LanguageAutocompleteProps {
  onChange: (value?: LanguageOption | readonly LanguageOption[]) => void
  value?: LanguageOption | LanguageOption[]
  multipleSelect?: boolean
  limit?: number
  languages?: Language[]
  loading: boolean
  helperText?: string
  renderInput?: (params: AutocompleteRenderInputParams) => ReactNode
  renderOption?: (params: HTMLAttributes<HTMLLIElement>) => ReactNode
}

export function LanguageAutocomplete({
  onChange: handleChange,
  value,
  multipleSelect = false,
  limit,
  languages,
  loading,
  renderInput,
  renderOption
}: LanguageAutocompleteProps): ReactElement {
  const options = useMemo(() => {
    return (
      languages?.map(({ id, name }) => {
        const localLanguageName = name.find(({ primary }) => !primary)?.value
        const nativeLanguageName = name.find(({ primary }) => primary)?.value

        return {
          id,
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

  const defaultRenderInput = (
    params: AutocompleteRenderInputParams
  ): ReactNode => (
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
            {loading ? <CircularProgress color="inherit" size={20} /> : null}
            {params.InputProps.endAdornment}
          </>
        )
      }}
    />
  )

  const defaultRenderOption = (
    props: HTMLAttributes<HTMLLIElement>,
    { localName, nativeName }: LanguageOption
  ): ReactNode => {
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
  }

  return (
    <Autocomplete
      multiple={multipleSelect}
      disableCloseOnSelect={multipleSelect}
      limitTags={limit}
      disableClearable
      value={multipleSelect ? undefined : value}
      isOptionEqualToValue={(option, value) => {
        if (multipleSelect && Array.isArray(value)) {
          return value.some((val) => val.id === option.id)
        }
        return option.id === value.id
      }}
      getOptionLabel={({ localName, nativeName }) =>
        localName ?? nativeName ?? ''
      }
      onChange={(_event, option) => handleChange(option)}
      options={sortedOptions}
      loading={loading}
      disablePortal={process.env.NODE_ENV === 'test'}
      renderInput={renderInput != null ? renderInput : defaultRenderInput}
      renderOption={renderOption != null ? renderOption : defaultRenderOption}
    />
  )
}
