import Autocomplete, {
  AutocompleteRenderInputParams
} from '@mui/material/Autocomplete'
import CircularProgress from '@mui/material/CircularProgress'
import { PopperProps } from '@mui/material/Popper'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { HTMLAttributes, ReactElement, ReactNode, useMemo } from 'react'
import { FixedSizeList as List } from 'react-window'

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
  onChange: (value?: LanguageOption) => void
  value?: LanguageOption
  languages?: Language[]
  loading: boolean
  helperText?: string
  renderInput?: (params: AutocompleteRenderInputParams) => ReactNode
  renderOption?: (params: HTMLAttributes<HTMLLIElement>) => ReactNode
  popper?: Omit<PopperProps, 'open'>
}

export function LanguageAutocomplete({
  onChange: handleChange,
  value,
  languages,
  loading,
  renderInput,
  renderOption,
  helperText,
  popper
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
      helperText={helperText}
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
    { localName, nativeName, id }: LanguageOption
  ): ReactNode => {
    console.log(props)
    return (
      <li {...props} key={id}>
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

  function ListboxComponent(props): ReactElement {
    console.log(props)
    const theme = useTheme()
    const smUp = useMediaQuery(theme.breakpoints.up('sm'), {
      noSsr: true
    })
    const itemCount = options.length
    const itemSize = smUp ? 36 : 48

    return (
      <List
        width="100%"
        innerElementType="ul"
        itemSize={itemSize}
        overscanCount={5}
        itemCount={itemCount}
      >
        {renderOption != null ? renderOption : defaultRenderOption}
      </List>
    )
  }

  return (
    <Autocomplete
      open
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
      renderInput={renderInput != null ? renderInput : defaultRenderInput}
      renderOption={renderOption != null ? renderOption : defaultRenderOption}
      slotProps={{
        popper,
        listbox: ListboxComponent
      }}
    />
  )
}
