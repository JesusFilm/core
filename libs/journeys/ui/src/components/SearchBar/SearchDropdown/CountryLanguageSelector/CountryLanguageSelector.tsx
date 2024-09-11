import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  RefinementListItem,
  RefinementListRenderState
} from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import orderBy from 'lodash/orderBy'
import Image from 'next/image'
import { ReactElement, useEffect, useState } from 'react'

import { useSearchBar } from '../../../../libs/algolia/SearchBarProvider'
import { useCountryQuery } from '../../../../libs/useCountryQuery'

interface CountryLanguageSelectorProps {
  refinements: RefinementListRenderState
}

export function CountryLanguageSelector({
  refinements
}: CountryLanguageSelectorProps): ReactElement {
  const { items, refine } = refinements
  const [country, setCountry] = useState<string>()
  const [countryCode, setCountryCode] = useState<string>()

  const { data } = useCountryQuery({ countryId: countryCode ?? '' })
  const { dispatch } = useSearchBar()

  function getTopSpokenLanguages(
    availableLanguages: RefinementListItem[]
  ): string[] {
    const availableLanguageSet = new Set(
      availableLanguages.map((lang) => lang.value)
    )
    const countryLanguages = data?.country?.countryLanguages ?? []
    return orderBy(countryLanguages, ['speakers'], ['desc'])
      .map(({ language }) => {
        const localName = language.name.find(({ primary }) => !primary)?.value
        const nativeName = language.name.find(({ primary }) => primary)?.value
        return localName ?? nativeName ?? ''
      })
      .filter(Boolean)
      .filter((language) => availableLanguageSet.has(language))
      .slice(0, 4)
  }

  const spokenLanguages = getTopSpokenLanguages(items)

  function getCountryName(countryCode: string): string {
    try {
      // set to 'en' as Watch is only translated to English
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
        <Stack
          spacing={4}
          direction="row"
          alignItems="center"
          sx={{ pt: 6, pb: 3 }}
        >
          <Image
            src={data?.country?.flagPngSrc ?? ''}
            alt={country}
            width={40}
            height={20}
          />
          <Typography variant="h6">{country}: </Typography>
          {spokenLanguages.length > 0 &&
            spokenLanguages.map((language) => (
              <Chip
                clickable
                key={language}
                label={language}
                variant="outlined"
                size="medium"
                onClick={() => {
                  refine(language)
                  dispatch({
                    type: 'RemoveLanguageContinents',
                    language
                  })
                }}
                sx={{
                  border: (theme) =>
                    `2px solid ${theme.palette.text.primary}${
                      theme.palette.mode === 'dark' ? '2E' : '1A'
                    }`
                }}
              />
            ))}
        </Stack>
      )}
    </>
  )
}
