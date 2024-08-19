import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import { Formik } from 'formik'
import debounce from 'lodash/debounce'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useMemo, useState } from 'react'
import { useSearchBox } from 'react-instantsearch'

import LinkIcon from '@core/shared/ui/icons/Link'
import Search1Icon from '@core/shared/ui/icons/Search1'
import { SubmitListener } from '@core/shared/ui/SubmitListener'

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

  const initialValues = {
    title: search
  }

  function handleSearchChange(values: typeof initialValues): void {
    setSearch(values.title)
    if (variant === 'internal') refine(values.title)
    if (variant === 'youtube') handleChange(values.title)
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
      <Formik
        initialValues={initialValues}
        onSubmit={handleSearchChange}
        enableReinitialize
      >
        {({ values, handleChange }) => (
          <>
            <TextField
              label={label ?? t('Search by title in JF Library')}
              variant="filled"
              name="title"
              type="search"
              fullWidth
              autoComplete="off"
              value={values.title}
              onChange={handleChange}
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
            <SubmitListener />
          </>
        )}
      </Formik>
    </Box>
  )
}
