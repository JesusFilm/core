import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded'
import Stack from '@mui/material/Stack'
import { alpha } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { GALLERY_ACCENT } from '../PublicGalleryPage'

import { GALLERY_TEXT_PRIMARY, GALLERY_TEXT_SECONDARY } from './galleryTokens'

export function PublicTemplateGalleryEmptyState(): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')

  return (
    <Stack
      data-testid="PublicTemplateGalleryEmptyState"
      spacing={3}
      alignItems="center"
      justifyContent="center"
      sx={{
        textAlign: 'center',
        py: 12,
        px: 5,
        borderRadius: 3,
        border: '1px dashed',
        borderColor: alpha(GALLERY_ACCENT, 0.4)
      }}
    >
      <GridViewRoundedIcon sx={{ fontSize: 48, color: GALLERY_ACCENT }} />
      <Stack spacing={1} alignItems="center">
        <Typography variant="h5" sx={{ color: GALLERY_TEXT_PRIMARY }}>
          {t('No templates to show yet')}
        </Typography>
        <Typography variant="body2" sx={{ color: GALLERY_TEXT_SECONDARY }}>
          {t('Check back soon — new templates are on the way.')}
        </Typography>
      </Stack>
    </Stack>
  )
}
