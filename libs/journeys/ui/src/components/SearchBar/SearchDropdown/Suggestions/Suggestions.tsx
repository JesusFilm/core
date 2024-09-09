import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { useSearchBox } from 'react-instantsearch'

import { normalizeLanguage } from '../../../../libs/algolia/normalizeLanguage'
import { capitalizeFirstLetter } from '../../../../libs/algolia/normalizeLanguage/normalizeLanguage'

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

  function selectSuggestion(suggestion: string): void {
    const suggestionParts = suggestion.split(/\s(?:in|and)\s/)
    refineLanguages(suggestionParts.slice(1))
  }

  const unrefinedLanguages = items
    .filter((item) => !item.isRefined)
    .slice(0, MAX_QUERY_SUGGESTIONS)

  const firstLanguage = capitalizeFirstLetter(
    normalizeLanguage(unrefinedLanguages[0].value)
  )
  const secondLanguage = capitalizeFirstLetter(
    normalizeLanguage(unrefinedLanguages[1].value)
  )

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
              filters={[firstLanguage]}
              handleClick={() => {
                if (query === '') {
                  refineQuery('Jesus')
                }
                selectSuggestion(`Jesus in ${firstLanguage}`)
              }}
            />
          )}
          {unrefinedLanguages.length > 1 && (
            <Suggestion
              query={query !== '' ? query : 'Jesus'}
              filters={[firstLanguage, secondLanguage]}
              handleClick={() => {
                if (query === '') {
                  refineQuery('Jesus')
                }
                selectSuggestion(
                  `Jesus in ${firstLanguage} and ${secondLanguage}`
                )
              }}
            />
          )}
        </Stack>
      </Box>
    </Box>
  )
}
