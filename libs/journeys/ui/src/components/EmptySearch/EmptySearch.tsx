import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

export function EmptySearch(): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        borderRadius: 4,
        width: '100%',
        padding: 8
      }}
    >
      <Typography
        variant="h6"
        sx={{
          color: 'primary.main'
        }}
      >
        {t('Sorry, no results')}
      </Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        {t('Try removing or changing something from your request')}
      </Typography>
    </Paper>
  )
}
