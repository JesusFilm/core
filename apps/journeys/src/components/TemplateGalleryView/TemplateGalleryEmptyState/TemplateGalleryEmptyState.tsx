import InboxRoundedIcon from '@mui/icons-material/InboxRounded'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

export function TemplateGalleryEmptyState(): ReactElement {
  const { t } = useTranslation('apps-journeys')

  return (
    <Stack
      data-testid="TemplateGalleryEmptyState"
      alignItems="center"
      spacing={2}
      sx={{ py: 8, color: 'text.secondary' }}
    >
      <InboxRoundedIcon sx={{ fontSize: 48 }} />
      <Typography variant="body1">
        {t('This gallery has no templates yet.')}
      </Typography>
    </Stack>
  )
}
