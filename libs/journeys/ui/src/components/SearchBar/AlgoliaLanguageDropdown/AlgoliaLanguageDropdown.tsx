import Box from '@mui/material/Box'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Popper from '@mui/material/Popper'
import Stack from '@mui/material/Stack'
import { ReactElement, ReactNode } from 'react'
import { useRefinementList } from 'react-instantsearch'

import { useLanguagesContinentsQuery } from '../../../libs/useLanguagesContinentsQuery'
import { useSortLanguageContinents } from '../../../libs/useSortLanguageContinents'

import { RefinementGroup } from './RefinementGroup'

interface AlgoliaLanguageDropdownProps {
  open: boolean
  handleClickAway: () => void
  id?: string
  anchorEl?: HTMLElement | null
}

export function AlgoliaLanguageDropdown({
  open,
  handleClickAway,
  id,
  anchorEl
}: AlgoliaLanguageDropdownProps): ReactElement {
  const { data } = useLanguagesContinentsQuery()
  const languages = useSortLanguageContinents({
    languages: data?.languages ?? []
  })
  const refinements = useRefinementList({
    attribute: 'languageEnglishName',
    limit: 1000
  })

  function ContinentRefinements(): ReactNode {
    return (
      <>
        {Object.entries(languages).map(([continent, continentLanguages]) => {
          const items = refinements.items.filter((item) =>
            continentLanguages.some((language) => language === item.label)
          )

          return (
            <RefinementGroup
              key={continent}
              title={continent}
              refinement={{
                ...refinements,
                items
              }}
            />
          )
        })}
      </>
    )
  }

  return (
    <Popper
      id={id}
      open={open}
      anchorEl={anchorEl}
      placement="bottom-end"
      sx={{ width: anchorEl?.clientWidth }}
      data-testid="SearchLangaugeFilter"
      modifiers={[
        {
          name: 'flip',
          enabled: false
        }
      ]}
    >
      <ClickAwayListener onClickAway={handleClickAway}>
        <Box
          borderRadius={3}
          boxShadow="0px 4px 4px 0px #00000040"
          sx={{ p: 8, bgcolor: 'background.paper', mt: 3 }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            color="text.primary"
            sx={{
              height: 445
            }}
          >
            <ContinentRefinements />
          </Stack>
        </Box>
      </ClickAwayListener>
    </Popper>
  )
}
