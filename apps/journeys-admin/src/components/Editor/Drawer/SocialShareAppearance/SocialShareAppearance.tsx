import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { DescriptionEdit } from './DescriptionEdit/DescriptionEdit'
import { ImageEdit } from './ImageEdit/ImageEdit'
import { TitleEdit } from './TitleEdit/TitleEdit'

export function SocialShareAppearance(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <Box sx={{ px: 6, py: 4 }}>
      <Typography variant="subtitle2" sx={{ pb: 4 }}>
        {t('Social Image')}
      </Typography>

      <ImageEdit />
      <TitleEdit />
      <DescriptionEdit />
    </Box>
  )
}
