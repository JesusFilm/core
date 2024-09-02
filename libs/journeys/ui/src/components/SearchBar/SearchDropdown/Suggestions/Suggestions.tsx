import Box from '@mui/material/Box'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { useSearchBox } from 'react-instantsearch'

import Globe1Icon from '@core/shared/ui/icons/Globe1'

interface SuggestionsProps {
  refinements: RefinementListRenderState
}

export function Suggestions({ refinements }: SuggestionsProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const { refine } = useSearchBox()
  const { refine: refineLanguages } = refinements

  function selectSuggestion(suggestion: string): void {
    const suggestionParts = suggestion.split(/\s(?:in|and)\s/)
    if (suggestionParts.length === 2) {
      refine(suggestionParts[0])
      refineLanguages(suggestionParts[1])
    }
    if (suggestionParts.length === 3) {
      refine(suggestionParts[0])
      refineLanguages(suggestionParts[1])
      refineLanguages(suggestionParts[2])
    }
  }

  return (
    <Box width="100%">
      <Typography variant="h6" color="primary.main" marginBottom={6} pl={3}>
        {t('Suggestions')}
      </Typography>
      <Box color="text.primary">
        <Stack spacing={1}>
          <MenuItem
            sx={{ p: 3, borderRadius: 3 }}
            value="Jesus in English"
            onClick={() => selectSuggestion('Jesus in English')}
          >
            <ListItemIcon>
              <Globe1Icon />
            </ListItemIcon>
            <ListItemText>
              <Typography display="inline" fontWeight="1000">
                {t('Jesus')}
              </Typography>
              <Typography display="inline">{t(' in English')}</Typography>
            </ListItemText>
            <Typography variant="body1" color="text.secondary" ml={6}>
              {t('Language')}
            </Typography>
          </MenuItem>
          <MenuItem
            sx={{ p: 3, borderRadius: 3 }}
            value="Jesus in English and Spanish, Latin American"
            onClick={() =>
              selectSuggestion('Jesus in English and Spanish, Latin American')
            }
          >
            <ListItemIcon>
              <Globe1Icon />
            </ListItemIcon>
            <ListItemText>
              <Typography display="inline" fontWeight="1000">
                {t('Jesus')}
              </Typography>
              <Typography display="inline">
                {t(' in English and Spanish, Latin American')}
              </Typography>
            </ListItemText>
            <Typography variant="body1" color="text.secondary" ml={6}>
              {t('Language')}
            </Typography>
          </MenuItem>
        </Stack>
      </Box>
    </Box>
  )
}
