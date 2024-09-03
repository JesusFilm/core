import Box from '@mui/material/Box'
import Popper from '@mui/material/Popper'
import { ReactElement } from 'react'
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
  const { data } = useLanguagesContinentsQuery()
  const languages = useSortLanguageContinents({
    languages: data?.languages ?? []
  })
  const refinements = useRefinementList({
    attribute: 'languageEnglishName',
    showMore: true,
    limit: 5,
    showMoreLimit: 5000
  })

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
        color="text.primary"
      >
        <LanguageContinentRefinements
          refinements={refinements}
          languages={languages}
        />
      </Box>
    </Popper>
  )
}
