import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import Autocomplete from '@mui/material/Autocomplete'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { FormEvent, ReactElement, useMemo, useState } from 'react'

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
  onBlur?: (e?: FormEvent<HTMLFormElement> | undefined) => void
}

export function MultipleLanguageAutocomplete({
  onChange: handleChange,
  values,
  languages,
  loading,
  onBlur
}: MultipleLanguageAutocompleteProps): ReactElement {
  const [openPopper, setOpenPopper] = useState(true)

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

  const filteredOptions = (
    options: LanguageOption[],
    { inputValue }: { inputValue: string }
  ): LanguageOption[] => {
    const userInput = inputValue.toLowerCase()
    const filteredOptions = options.filter((option) =>
      (
        (option.localName?.toLowerCase() ?? '') +
        (option.nativeName?.toLowerCase() ?? '')
      ).includes(userInput)
    )

    return filteredOptions.length > 0 ? filteredOptions : options
  }

  return (
    <Autocomplete
      multiple
      disableCloseOnSelect
      value={values}
      onChange={(_event, option) => handleChange(option)}
      open={openPopper}
      onOpen={() => setOpenPopper(true)}
      onClose={() => setOpenPopper(false)}
      onBlur={() => onBlur?.()}
      options={sortedOptions}
      limitTags={3}
      loading={loading}
      filterOptions={filteredOptions}
      isOptionEqualToValue={(option, values) => option.id === values.id}
      getOptionLabel={({ localName, nativeName }) =>
        localName ?? nativeName ?? ''
      }
      renderInput={(params) => (
        <TextField
          {...params}
          inputRef={(input) => input?.focus()}
          hiddenLabel
          placeholder="Search Language"
          variant="filled"
          InputProps={{
            ...params.InputProps,
            sx: { paddingBottom: 2 },
            onKeyDown: (e) => {
              if (e.key === 'Enter') {
                e.stopPropagation()
                e.preventDefault()
                setOpenPopper(false)
              }
            },
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
        const { key, ...optionProps } = props
        return (
          <li key={key} {...optionProps}>
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
              checkedIcon={<CheckBoxIcon fontSize="small" />}
              sx={{ mr: 2 }}
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
