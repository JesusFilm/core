import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import Autocomplete from '@mui/material/Autocomplete'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { ReactElement, useMemo } from 'react'

export interface Language {
  id: string
  name: Translation[]
}

interface Translation {
  value: string
  primary: boolean
}

export interface LanguageOption {
  id: string
  localName?: string
  nativeName?: string
}

interface MultipleLanguageAutocompleteProps {
  onChange: (value?: readonly LanguageOption[]) => void
  values?: LanguageOption[]
  languages?: Language[]
  loading: boolean
  helperText?: string
}

export function MultipleLanguageAutocomplete({
  onChange: handleChange,
  values,
  languages,
  loading
}: MultipleLanguageAutocompleteProps): ReactElement {
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

  return (
    <Autocomplete
      multiple
      disableCloseOnSelect
      value={values}
      limitTags={2}
      onChange={(_event, option) => handleChange(option)}
      options={sortedOptions}
      loading={loading}
      isOptionEqualToValue={(option, values) => option.id === values.id}
      getOptionLabel={({ localName, nativeName }) =>
        localName ?? nativeName ?? ''
      }
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
      renderOption={(props, option, { selected }) => {
        const { localName, nativeName } = option
        return (
          <li {...props}>
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
              checkedIcon={<CheckBoxIcon fontSize="small" />}
              style={{ marginRight: 8 }}
              checked={selected}
            />
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
