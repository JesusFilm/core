import { ReactElement, useMemo, useEffect, useState } from 'react'
import InputAdornment from '@mui/material/InputAdornment'
import Search from '@mui/icons-material/Search'
import LinkRounded from '@mui/icons-material/LinkRounded'
import { debounce } from 'lodash'
import Box from '@mui/material/Box'
import { TextFieldForm } from '../../../TextFieldForm'

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

  function onSearchChange(value: string): void {
    setSearch(value)
    handleChange(value)
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
      <TextFieldForm
        id="videoSearch"
        label={label ?? 'Search by title in JF Library'}
        initialValues={search}
        handleSubmit={onSearchChange}
        inputProps={{
          'data-testid': 'VideoSearch',
          'aria-label': 'Search'
        }}
        endIcon={
          <InputAdornment position="end">
            {icon === 'search' && <Search />}
            {icon === 'link' && <LinkRounded />}
          </InputAdornment>
        }
        iconPosition="end"
      />
    </Box>
  )
}
