import { ReactElement, useMemo, useEffect, useState, ChangeEvent } from 'react'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Search from '@mui/icons-material/Search'
import { debounce } from 'lodash'

interface VideoSearchProps {
  value?: string
  onChange: (value: string) => void
}

export function VideoSearch({
  value,
  onChange
}: VideoSearchProps): ReactElement {
  const handleChange = useMemo(() => debounce(onChange, 500), [onChange])
  const [search, setSearch] = useState(value ?? '')

  function onSearchChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void {
    setSearch(e.target.value)
    handleChange(e.target.value)
  }

  useEffect(() => {
    return () => {
      handleChange.cancel()
    }
  }, [handleChange])

  return (
    <TextField
      hiddenLabel
      variant="filled"
      fullWidth
      value={search}
      onChange={onSearchChange}
      inputProps={{
        'data-testid': 'VideoSearch',
        'aria-label': 'Search'
      }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <Search />
          </InputAdornment>
        )
      }}
      sx={{
        px: 6,
        py: 8
      }}
    />
  )
}
