import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, useCallback, useEffect, useState } from 'react'

export function LocaleDetails(): ReactElement {
  const [country, setCountry] = useState('')

  // TODO: grab the country from languages query
  // Show chips of maybe top 4 languages from the region

  const detectCountry = useCallback(() => {
    const locale = navigator.language
    try {
      const regionCode = new Intl.Locale(locale).maximize().region
      const regionNames = new Intl.DisplayNames([locale], { type: 'region' })
      const countryName = regionNames.of(regionCode ?? '')
      setCountry(countryName ?? '')
    } catch (error) {
      console.error('Error detecting country:', error)
    }
  }, [])

  useEffect(() => {
    detectCountry()
  }, [detectCountry])

  return (
    <Stack spacing={2} sx={{ py: 6 }}>
      <Typography variant="h6">{country}: </Typography>
    </Stack>
  )
}
