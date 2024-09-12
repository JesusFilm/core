import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import Image from 'next/image'
import { ReactElement, useCallback, useEffect, useState } from 'react'

import { getTopSpokenLanguages } from '../../../../libs/algolia/getTopSpokenLanguages'
import { useSearchBar } from '../../../../libs/algolia/SearchBarProvider'
import { useCountryQuery } from '../../../../libs/useCountryQuery'

// The cookie is set by the watch middleware
// Only use for tests
export const NEXT_COUNTRY = 'NEXT_COUNTRY=00001---US'

interface CountryLanguageSelectorProps {
  refinements: RefinementListRenderState
}

export function CountryLanguageSelector({
  refinements
}: CountryLanguageSelectorProps): ReactElement {
  const { items, refine } = refinements

  const { dispatch } = useSearchBar()
  const [country, setCountry] = useState<string>()
  const [countryCode, setCountryCode] = useState<string>()
  const { data, loading } = useCountryQuery({ countryId: countryCode ?? '' })

  const spokenLanguages = getTopSpokenLanguages({
    country: data?.country,
    availableLanguages: items
  })

  function handleClick(language: string): void {
    const continent = data?.country?.continent?.name?.find(Boolean)?.value
    const refinedItem = items.find((item) => item.label === language)?.isRefined

    if (continent == null) return

    refine(language)

    if (refinedItem === true) {
      dispatch({
        type: 'RemoveLanguageContinents',
        language
      })
    } else {
      dispatch({
        type: 'SelectLanguageContinent',
        continent,
        language,
        isSelected: true
      })
    }
  }

  function getCountryCookie(): string | undefined {
    return document.cookie
      .split('; ')
      .find((row) => row.startsWith('NEXT_COUNTRY'))
      ?.split('=')[1]
  }

  function parseCountryName(countryCode: string): string | undefined {
    const displayNames = new Intl.DisplayNames(['en'], { type: 'region' })
    return displayNames.of(countryCode)
  }

  const findUserCountry = useCallback(() => {
    const countryCookie = getCountryCookie()
    if (countryCookie != null) {
      const [, countryCode] = countryCookie.split('---')
      const countryName = parseCountryName(countryCode)
      setCountry(countryName)
      setCountryCode(countryCode)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    findUserCountry()
  }, [findUserCountry])

  return (
    <>
      {country != null && (
        <Stack
          spacing={4}
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          sx={{ pt: 6, pb: 3 }}
        >
          <Box
            sx={{
              gap: 4,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            {loading ? (
              <>
                <Skeleton variant="rectangular" width={35} height={15} />
                <Skeleton variant="text" width={150} height={62} />
              </>
            ) : (
              <>
                {data?.country?.flagPngSrc != null && (
                  <Image
                    src={data.country.flagPngSrc}
                    alt={country}
                    width={40}
                    height={20}
                  />
                )}
                <Typography variant="h6">{country}: </Typography>
              </>
            )}
          </Box>
          <Box
            sx={{
              gap: 4,
              display: 'flex',
              flexWrap: 'wrap'
            }}
          >
            {loading
              ? [1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rounded" width={80} height={32} />
                ))
              : spokenLanguages.length > 0 &&
                spokenLanguages.map((language) => (
                  <Chip
                    clickable
                    key={language}
                    label={language}
                    variant="outlined"
                    size="medium"
                    onClick={() => handleClick(language)}
                    sx={{
                      border: (theme) =>
                        `2px solid ${theme.palette.text.primary}${
                          theme.palette.mode === 'dark' ? '2E' : '1A'
                        }`
                    }}
                  />
                ))}
          </Box>
        </Stack>
      )}
    </>
  )
}
