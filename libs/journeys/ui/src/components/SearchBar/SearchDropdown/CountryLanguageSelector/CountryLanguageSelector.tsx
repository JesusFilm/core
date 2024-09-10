import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, useEffect, useState } from 'react'

import { useCountryQuery } from '../../../../libs/useCountryQuery/useCountryQuery'

export function CountryLanguageSelector(): ReactElement {
  const [country, setCountry] = useState<string>()
  const [countryCode, setCountryCode] = useState<string>()

  const { data } = useCountryQuery({ countryId: countryCode ?? '' })
  console.log(data)

  function getCountryName(countryCode: string): string {
    try {
      // set to 'en' as Watch only supports English
      const displayNames = new Intl.DisplayNames(['en'], { type: 'region' })
      return displayNames.of(countryCode) ?? countryCode
    } catch (error) {
      console.error('Error converting Country Code: ', error)
      return countryCode
    }
  }

  useEffect(() => {
    const countryCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('NEXT_COUNTRY'))
      ?.split('=')[1]

    if (countryCookie != null) {
      const [, countryCode] = countryCookie.split('---')
      const countryName = getCountryName(countryCode)
      setCountry(countryName)
      setCountryCode(countryCode)
    }
  }, [])

  return (
    <>
      {country != null && (
        <Stack spacing={2} sx={{ pt: 6, pb: 3 }}>
          <Typography variant="h6">{country}: </Typography>
        </Stack>
      )}
    </>
  )
}
