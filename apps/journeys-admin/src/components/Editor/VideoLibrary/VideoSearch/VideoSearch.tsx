import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import debounce from 'lodash/debounce'
import { ChangeEvent, ReactElement, useEffect, useMemo, useState } from 'react'

import Link from '@core/shared/ui/icons/Link'
import Search1 from '@core/shared/ui/icons/Search1'

interface VideoSearchProps {
  label?: string
  value?: string
  onChange: (value: string) => void
  icon?: 'search' | 'link'
}

export function VideoSearch({
  label,
  value,
  onChange,
  icon
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
    <Box
      sx={{
        px: 6,
        py: 8
      }}
    >
      <TextField
        label={label ?? 'Search by title in JF Library'}
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
              {icon === 'search' && <Search1 />}
              {icon === 'link' && <Link />}
            </InputAdornment>
          )
        }}
      />
    </Box>
  )
}
