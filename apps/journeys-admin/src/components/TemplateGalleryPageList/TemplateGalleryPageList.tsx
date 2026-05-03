import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

export function TemplateGalleryPageList(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <Box sx={{ p: 4 }} data-testid="TemplateGalleryPageList">
      <Typography variant="h4">{t('Collections')}</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
        {t('Group your team templates into a public gallery page.')}
      </Typography>
    </Box>
  )
}
