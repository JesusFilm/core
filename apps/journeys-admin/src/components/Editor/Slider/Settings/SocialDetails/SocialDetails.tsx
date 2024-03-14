import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { Drawer } from '../Drawer'
import { ImageEdit } from '../Drawer/ImageEdit'

import { DescriptionEdit } from './DescriptionEdit'
import { TitleEdit } from './TitleEdit'

export function SocialDetails(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <Drawer title={t('Social Share Preview')}>
      <Box sx={{ px: 6, py: 4 }} data-testid="SocialShareAppearance">
        <Typography variant="subtitle2" sx={{ pb: 4 }}>
          {t('Social Image')}
        </Typography>
        <ImageEdit />
        <TitleEdit />
        <DescriptionEdit />
      </Box>
    </Drawer>
  )
}
