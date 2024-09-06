import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { ReactElement } from 'react'
import { useSearchBox } from 'react-instantsearch'

import { Suggestion } from './Suggestion'

interface SuggestionsProps {
  refinements: RefinementListRenderState
  languages: Record<string, string[]>
  handleLanguagesSelect: (
    continent: string,
    language: string,
    isRefined: boolean
  ) => void
}

export function Suggestions({
  refinements,
  languages,
  handleLanguagesSelect
}: SuggestionsProps): ReactElement {
  const { refine } = useSearchBox()
  const { items, refine: refineLanguage } = refinements

  function findLanguageContinent(language: string): string | undefined {
    return Object.entries(languages).find(([_, languages]) =>
      languages.includes(language)
    )?.[0]
  }

  function refineLanguages(languagesToRefine: string[]): void {
    languagesToRefine.forEach((language) => {
      const refinement = items.find((item) => item.value === language)
      if (refinement?.isRefined === false) {
        refineLanguage(language)
        const continent = findLanguageContinent(language)
        if (continent != null)
          handleLanguagesSelect(continent, language, !refinement?.isRefined)
      }
    })
  }

  function selectSuggestion(suggestion: string): void {
    const suggestionParts = suggestion.split(/\s(?:in|and)\s/)
    refine(suggestionParts[0])
    refineLanguages(suggestionParts.slice(1))
  }

  return (
    <Box width="100%">
      <Box color="text.primary">
        <Stack spacing={1}>
          <Suggestion
            query="Jesus"
            filters={['English']}
            handleClick={() => selectSuggestion('Jesus in English')}
          />
          <Suggestion
            query="Jesus"
            filters={['English', 'Spanish']}
            handleClick={() =>
              selectSuggestion('Jesus in English and Spanish, Latin American')
            }
          />
        </Stack>
      </Box>
    </Box>
  )
}
