import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import debounce from 'lodash/debounce'
import { useTranslation } from 'next-i18next'
import { ChangeEvent, ReactElement, useEffect, useMemo, useState } from 'react'
import { useSearchBox } from 'react-instantsearch'

import LinkIcon from '@core/shared/ui/icons/Link'
import Search1Icon from '@core/shared/ui/icons/Search1'

interface VideoSearchProps {
  variant: 'internal' | 'youtube'
  label?: string
  value?: string
  onChange: (value: string) => void
  icon?: 'search' | 'link'
}

export function VideoSearch({
  label,
  value,
  onChange,
  icon,
  variant
}: VideoSearchProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const { refine } = useSearchBox()

  const handleChange = useMemo(() => debounce(onChange, 500), [onChange])
  const [search, setSearch] = useState(value ?? '')

  function handleSearchChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void {
    setSearch(e.target.value)
    if (variant === 'internal') refine(e.target.value)
    if (variant === 'youtube') handleChange(e.target.value)
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
      data-testid="VideoSearch"
    >
      <TextField
        label={label ?? t('Search by title in JF Library')}
        variant="filled"
        fullWidth
        value={search}
        onChange={handleSearchChange}
        inputProps={{
          'data-testid': 'VideoSearch',
          'aria-label': 'Search'
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {icon === 'search' && <Search1Icon />}
              {icon === 'link' && <LinkIcon />}
            </InputAdornment>
          )
        }}
      />
    </Box>
  )
}
