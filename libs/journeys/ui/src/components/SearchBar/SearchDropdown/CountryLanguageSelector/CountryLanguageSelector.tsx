import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import Image from 'next/image'
import { ReactElement, useEffect, useState } from 'react'

import { getTopSpokenLanguages } from '../../../../libs/algolia/getTopSpokenLanguages'
import { useSearchBar } from '../../../../libs/algolia/SearchBarProvider'
import { useCountryQuery } from '../../../../libs/useCountryQuery'

interface CountryLanguageSelectorProps {
  countryCode?: string
  refinements: RefinementListRenderState
}

export function CountryLanguageSelector({
  countryCode,
  refinements
}: CountryLanguageSelectorProps): ReactElement {
  const { items, refine } = refinements

  const { dispatch } = useSearchBar()
  const [country, setCountry] = useState<string>()
  const { data } = useCountryQuery({ countryId: countryCode ?? '' })

  const spokenLanguages = getTopSpokenLanguages({
    country: data?.country,
    availableLanguages: items
  })

  function handleClick(language: string): void {
    const continent = data?.country?.continent?.name?.find(Boolean)?.value
    const refinedItem = items.find((item) => item.label === language)?.isRefined

    if (continent == null) return

    refine(language)

    if (refinedItem === false) {
      dispatch({
        type: 'SelectLanguageContinent',
        continent,
        language,
        isSelected: true
      })
    }
  }

  function parseCountryName(countryCode: string): string | undefined {
    const displayNames = new Intl.DisplayNames(['en'], { type: 'region' })
    return displayNames.of(countryCode)
  }

  useEffect(() => {
    if (countryCode != null) {
      const countryName = parseCountryName(countryCode)
      setCountry(countryName)
    }
  }, [countryCode])

  return (
    <>
      {country != null &&
        data?.country != null &&
        spokenLanguages.length > 0 && (
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
              {data?.country.flagPngSrc != null && (
                <Image
                  src={data?.country?.flagPngSrc}
                  alt={country}
                  width={25}
                  height={15}
                />
              )}
              <Typography variant="h6">{country}: </Typography>
            </Box>
            <Box
              sx={{
                gap: 4,
                display: 'flex',
                flexWrap: 'wrap'
              }}
            >
              {spokenLanguages.map((language) => (
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
