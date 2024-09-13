import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { useSearchBox } from 'react-instantsearch'

import {
  parseSuggestion,
  stripLanguageFromQuery
} from '../../../../libs/algolia/languageUtils'

import { Suggestion } from './Suggestion'

interface SuggestionsProps {
  refinements: RefinementListRenderState
}

const MAX_QUERY_SUGGESTIONS = 2

export function Suggestions({ refinements }: SuggestionsProps): ReactElement {
  const { t } = useTranslation('apps-watch')

  const { query, refine: refineQuery } = useSearchBox()
  const { items, refine: refineLanguage } = refinements

  function refineLanguages(languagesToRefine: string[]): void {
    languagesToRefine.forEach((language) => {
      const refinement = items.find((item) => item.value === language)
      if (refinement?.isRefined === false) {
        refineLanguage(language)
      }
    })
  }

  function stripLanguagesFromQuery(languagesToStrip: string[]): string {
    let strippedQuery = query
    languagesToStrip.forEach((language) => {
      strippedQuery = stripLanguageFromQuery(language, strippedQuery)
    })
    return strippedQuery
  }

  function updateQuery(languagesToStrip: string[]): void {
    if (query === '') {
      refineQuery('Jesus')
    } else {
      const strippedQuery = stripLanguagesFromQuery(languagesToStrip)
      if (query !== strippedQuery) refineQuery(strippedQuery)
    }
  }

  function selectSuggestion(suggestion: string): void {
    const suggestionParts = parseSuggestion(suggestion)
    updateQuery(suggestionParts.slice(1))
    refineLanguages(suggestionParts.slice(1))
  }

  const unrefinedLanguages = items
    .filter((item) => !item.isRefined)
    .slice(0, MAX_QUERY_SUGGESTIONS)
    .map((item) => item.value)

  return (
    <Box width="100%">
      <Box color="text.primary">
        <Stack spacing={1}>
          {unrefinedLanguages.length === 0 && (
            <Typography>
              {t('There are no suggestions for this search')}
            </Typography>
          )}
          {unrefinedLanguages.length > 0 && (
            <Suggestion
              query={query !== '' ? query : 'Jesus'}
              filters={[unrefinedLanguages[0]]}
              handleClick={() =>
                selectSuggestion(`Jesus in ${unrefinedLanguages[0]}`)
              }
            />
          )}
          {unrefinedLanguages.length > 1 && (
            <Suggestion
              query={query !== '' ? query : 'Jesus'}
              filters={[unrefinedLanguages[0], unrefinedLanguages[1]]}
              handleClick={() =>
                selectSuggestion(
                  `Jesus in ${unrefinedLanguages[0]} and ${unrefinedLanguages[1]}`
                )
              }
            />
          )}
        </Stack>
      </Box>
    </Box>
  )
}
