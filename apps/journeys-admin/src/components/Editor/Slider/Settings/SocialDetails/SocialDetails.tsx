import Box from '@mui/material/Box'
import type { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'

import { EditorDrawer } from '../Drawer/EditorDrawer'
import { ImageEdit } from '../Drawer/ImageEdit'

import { DescriptionEdit } from './DescriptionEdit'
import { TitleEdit } from './TitleEdit'

export function SocialDetails(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { dispatch } = useEditor()
  const xs = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))

  function onClose(): void {
    dispatch({
      type: 'SetActiveSlideAction',
      activeSlide: ActiveSlide.JourneyFlow
    })
  }

  return (
    <EditorDrawer
      title={t('Social Share Preview')}
      onClose={xs ? onClose : undefined}
    >
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
