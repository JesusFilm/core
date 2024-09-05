import Box from '@mui/material/Box'
import Popper from '@mui/material/Popper'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { ReactElement } from 'react'

import { useLanguagesContinentsQuery } from '../../../libs/useLanguagesContinentsQuery'
import { useSortLanguageContinents } from '../../../libs/useSortLanguageContinents'

import { LanguageContinentRefinements } from './LanguageContinentRefinements'
import { Suggestions } from './Suggestions'

interface SearchbarDropdownProps {
  open: boolean
  refinements: RefinementListRenderState
  id?: string
  anchorEl?: HTMLElement | null
  variant?: string
  handleLanguagesSelect: (
    continent: string,
    language: string,
    isRefined: boolean
  ) => void
  selectedLanguagesByContinent?: Record<string, string[]>
}

export function SearchbarDropdown({
  open,
  refinements,
  id,
  anchorEl,
  variant = 'languages',
  handleLanguagesSelect,
  selectedLanguagesByContinent
}: SearchbarDropdownProps): ReactElement {
  const { data } = useLanguagesContinentsQuery()
  const languages = useSortLanguageContinents({
    languages: data?.languages ?? []
  })

  return (
    <Popper
      id={id}
      open={open}
      anchorEl={anchorEl}
      placement="bottom-end"
      sx={{ width: anchorEl?.clientWidth }}
      data-testid="SearchBarDropdown"
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
        {variant === 'languages' && (
          <LanguageContinentRefinements
            refinements={refinements}
            languages={languages}
            selectedLanguagesByContinent={selectedLanguagesByContinent}
            handleLanguagesSelect={handleLanguagesSelect}
          />
        )}
        {variant === 'suggestions' && <Suggestions refinements={refinements} />}
      </Box>
    </Popper>
  )
}
