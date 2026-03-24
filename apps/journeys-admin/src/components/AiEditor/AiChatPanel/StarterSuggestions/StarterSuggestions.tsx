import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

interface StarterSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void
}

export function StarterSuggestions({
  onSuggestionClick
}: StarterSuggestionsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const suggestionsRow1 = [
    t('Build a 5-card onboarding flow'),
    t('Add a poll to card 2')
  ]

  const suggestionsRow2 = [
    t('Translate all cards to Spanish'),
    t('Add images to each card')
  ]

  return (
    <Box
      data-testid="StarterSuggestions"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        maxWidth: 400,
        px: 2
      }}
    >
      <AutoAwesomeIcon
        sx={{ fontSize: 40, color: '#DEDFE0', mb: 2 }}
      />
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          color: 'text.primary',
          mb: 1
        }}
      >
        {t('AI Journey Editor')}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          mb: 3,
          lineHeight: 1.5
        }}
      >
        {t('Describe what you want to build or change.')}
        <br />
        {t('The AI will edit your journey in real-time.')}
      </Typography>

      <Stack spacing={1.5} sx={{ width: '100%' }}>
        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          flexWrap="wrap"
        >
          {suggestionsRow1.map((suggestion) => (
            <Chip
              key={suggestion}
              label={suggestion}
              variant="outlined"
              onClick={() => onSuggestionClick(suggestion)}
              aria-label={suggestion}
              tabIndex={0}
              sx={{
                borderRadius: '20px',
                borderColor: 'divider',
                color: 'text.primary',
                fontSize: 13,
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: '#F5F5F5',
                  borderColor: 'text.secondary'
                }
              }}
            />
          ))}
        </Stack>
        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          flexWrap="wrap"
        >
          {suggestionsRow2.map((suggestion) => (
            <Chip
              key={suggestion}
              label={suggestion}
              variant="outlined"
              onClick={() => onSuggestionClick(suggestion)}
              aria-label={suggestion}
              tabIndex={0}
              sx={{
                borderRadius: '20px',
                borderColor: 'divider',
                color: 'text.primary',
                fontSize: 13,
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: '#F5F5F5',
                  borderColor: 'text.secondary'
                }
              }}
            />
          ))}
        </Stack>
      </Stack>
    </Box>
  )
}
