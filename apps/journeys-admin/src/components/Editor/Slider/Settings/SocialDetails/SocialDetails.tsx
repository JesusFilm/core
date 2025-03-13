import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { EditorDrawer } from '../Drawer/EditorDrawer'
import { ImageEdit } from '../Drawer/ImageEdit'

import { DescriptionEdit } from './DescriptionEdit'
import { TitleEdit } from './TitleEdit'

export function SocialDetails(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <EditorDrawer title={t('Social Share Preview')}>
      <Box sx={{ px: 6, py: 4 }} data-testid="SocialShareAppearance">
        <Typography variant="subtitle2" sx={{ pb: 4 }}>
          {t('Social Image')}
        </Typography>
        <ImageEdit />
        <TitleEdit />
        <DescriptionEdit />
      </Box>
    </EditorDrawer>
  )
}
