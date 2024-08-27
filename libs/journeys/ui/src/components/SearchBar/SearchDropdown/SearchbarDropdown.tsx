import Box from '@mui/material/Box'
import Popper from '@mui/material/Popper'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, ReactNode } from 'react'
import { useRefinementList } from 'react-instantsearch'

import { useLanguagesContinentsQuery } from '../../../libs/useLanguagesContinentsQuery'
import { useSortLanguageContinents } from '../../../libs/useSortLanguageContinents'

import { RefinementGroup } from './RefinementGroup'

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
  const { t } = useTranslation('apps-watch')
  const theme = useTheme()

  const { data } = useLanguagesContinentsQuery()
  const languages = useSortLanguageContinents({
    languages: data?.languages ?? []
  })
  const refinements = useRefinementList({
    attribute: 'languageEnglishName',
    limit: 1000
  })

  function ContinentRefinements(): ReactNode {
    return refinements.items.length > 0 ? (
      <>
        {Object.entries(languages).map(([continent, continentLanguages]) => {
          const items = refinements.items.filter((item) =>
            continentLanguages.some((language) => language === item.label)
          )

          return items.length > 0 ? (
            <RefinementGroup
              key={continent}
              title={continent}
              refinement={{
                ...refinements,
                items
              }}
            />
          ) : (
            <></>
          )
        })}
      </>
    ) : (
      <Typography>
        {t(
          `Sorry, there are no languages available for this search. Try removing some of your search criteria!`
        )}
      </Typography>
    )
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
          <ContinentRefinements />
        </Stack>
      </Box>
    </Popper>
  )
}
