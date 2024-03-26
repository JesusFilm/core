import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { ImageEdit } from '../../ImageEdit'

import { DescriptionEdit } from './DescriptionEdit'
import { TitleEdit } from './TitleEdit'

export function SocialShareAppearance(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <Box sx={{ px: 6, py: 4 }} data-testid="SocialShareAppearance">
      <Typography variant="subtitle2" sx={{ pb: 4 }}>
        {t('Social Image')}
      </Typography>

      <ImageEdit />
      <TitleEdit />
      <DescriptionEdit />
    </Box>
  )
}
