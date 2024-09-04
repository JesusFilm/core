import Box from '@mui/material/Box'
import Popper from '@mui/material/Popper'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { ReactElement, useState } from 'react'
import { useRefinementList } from 'react-instantsearch'

import { useLanguagesContinentsQuery } from '../../../libs/useLanguagesContinentsQuery'
import { useSortLanguageContinents } from '../../../libs/useSortLanguageContinents'

import { LanguageContinentRefinements } from './LanguageContinentRefinements'

interface SearchbarDropdownProps {
  open: boolean
  id?: string
  anchorEl?: HTMLElement | null
}

export function SearchbarDropdown({
  open,
  id,
  anchorEl
}: SearchbarDropdownProps): ReactElement {
  const theme = useTheme()

  const { data } = useLanguagesContinentsQuery()
  const languages = useSortLanguageContinents({
    languages: data?.languages ?? []
  })
  const refinements = useRefinementList({
    attribute: 'languageEnglishName',
    limit: 1000
  })
  const [selectedLanguagesByContinent, setSelectedLanguagesByContinent] =
    useState<Record<string, string[]>>()

  function handleLanguageSelect(
    continent: string,
    language: string,
    isRefined: boolean
  ): void {
    const currentLanguages = selectedLanguagesByContinent?.[continent] ?? []

    const updatedLanguages = isRefined
      ? [...currentLanguages, language]
      : currentLanguages.filter((lang) => lang !== language)

    setSelectedLanguagesByContinent({
      ...selectedLanguagesByContinent,
      [continent]: updatedLanguages
    })
  }

  return (
    <Popper
      id={id}
      open={open}
      anchorEl={anchorEl}
      placement="bottom-end"
      sx={{ width: anchorEl?.clientWidth }}
      data-testid="SearchLanguageFilter"
      modifiers={[
        {
          name: 'flip',
          enabled: false
        }
      ]}
    >
      <Box
        borderRadius={3}
        boxShadow="0px 4px 4px 0px #00000040"
        sx={{ p: 8, bgcolor: 'background.paper', mt: 3 }}
      >
        <Stack
          color="text.primary"
          direction={{ xs: 'column', lg: 'row' }}
          justifyContent="space-around"
          sx={{
            [theme.breakpoints.down('lg')]: {
              gap: 6
            }
          }}
        >
          <LanguageContinentRefinements
            refinements={refinements}
            languages={languages}
            selectedLanguagesByContinent={selectedLanguagesByContinent}
            handleLanguagesSelect={handleLanguageSelect}
          />
        </Stack>
      </Box>
    </Popper>
  )
}
