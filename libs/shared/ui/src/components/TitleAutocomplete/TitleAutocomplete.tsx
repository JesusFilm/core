import { ReactElement, ReactNode, useMemo, HTMLAttributes } from 'react'
import Autocomplete, {
  AutocompleteRenderInputParams
} from '@mui/material/Autocomplete'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'

export interface Title {
  id: string
  title: Translation[]
  label: string
}

export interface Translation {
  value: string
}

export interface TitleAutocompleteProps {
  onChange: (value?: Title) => void
  value?: Title
  titles?: Title[]
  loading: boolean
  renderInput?: (params: AutocompleteRenderInputParams) => ReactNode
  renderOption?: (params: HTMLAttributes<HTMLLIElement>) => ReactNode
}

export function TitleAutocomplete({
  onChange: handleChange,
  value,
  titles,
  loading,
  renderInput,
  renderOption
}: TitleAutocompleteProps): ReactElement {
  const options = useMemo(() => {
    return (
      titles?.map(({ title, id, label }) => {
        return {
          id,
          title,
          label
        }
      }) ?? []
    )
  }, [titles])

  const sortedOptions = useMemo(() => {
    if (options.length > 0) {
      return options
        .sort((a, b) => {
          return (a.title[0].value ?? '').localeCompare(b.title[0].value ?? '')
        })
        .filter(function (item, pos, ary) {
          return (
            pos === 0 || item.title[0].value !== ary[pos - 1].title[0].value
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
      placeholder="Search Title"
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
    { title, label }: Title
  ): ReactNode => {
    return (
      <li {...props}>
        <Stack>
          <Typography>{title[0].value}</Typography>
          {title[0].value != null && (
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
          )}
        </Stack>
      </li>
    )
  }

  return (
    <Autocomplete
      disableClearable
      value={value}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      getOptionLabel={({ title }) => title[0].value ?? ''}
      onChange={(_event, option) => handleChange(option)}
      options={sortedOptions}
      loading={loading}
      disablePortal={process.env.NODE_ENV === 'test'}
      renderInput={renderInput != null ? renderInput : defaultRenderInput}
      renderOption={renderOption != null ? renderOption : defaultRenderOption}
    />
  )
}
