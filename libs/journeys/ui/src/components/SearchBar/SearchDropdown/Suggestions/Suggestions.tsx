import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { useSearchBox } from 'react-instantsearch'

import { Suggestion } from './Suggestion'

interface SuggestionsProps {
  refinements: RefinementListRenderState
}

export function Suggestions({ refinements }: SuggestionsProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const { refine } = useSearchBox()
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
    refine(suggestionParts[0])
    refineLanguages(suggestionParts.slice(1))
  }

  return (
    <Box width="100%">
      <Typography variant="h6" color="primary.main" marginBottom={6} pl={3}>
        {t('Suggestions')}
      </Typography>
      <Box color="text.primary">
        <Stack spacing={1}>
          <Suggestion
            query="Jesus"
            filters={['English']}
            handleClick={() => selectSuggestion('Jesus in English')}
          />
          <Suggestion
            query="Jesus"
            filters={['Spanish']}
            handleClick={() =>
              selectSuggestion('Jesus in Spanish, Latin American')
            }
          />
          <Suggestion
            query="Easter"
            filters={['English', 'Spanish']}
            handleClick={() =>
              selectSuggestion('Jesus in English and Spanish, Latin American')
            }
          />
          <Suggestion
            query="Love"
            filters={['French', 'Arabic']}
            handleClick={() =>
              selectSuggestion('Love in French and Arabic, Modern Standard')
            }
          />
        </Stack>
      </Box>
    </Box>
  )
}
