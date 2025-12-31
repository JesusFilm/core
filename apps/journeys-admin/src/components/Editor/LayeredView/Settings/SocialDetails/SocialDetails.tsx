import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'

import { DrawerTitle } from '../Drawer'
import { ImageEdit } from '../Drawer/ImageEdit'

import { DescriptionEdit } from './DescriptionEdit'
import { TitleEdit } from './TitleEdit'
import { Paper } from '@mui/material'
import { Stack } from '@mui/material'
import { DRAWER_WIDTH } from '../../../constants'

export function SocialDetails(): ReactElement {
  const { dispatch } = useEditor()
  const { t } = useTranslation('apps-journeys-admin')

  function onClose(): void {
    dispatch({
      type: 'SetActiveSlideAction',
      activeSlide: ActiveSlide.JourneyFlow
    })
  }
  return (
    <Stack
      component={Paper}
      elevation={0}
      sx={{
        height: '100%',
        width: DRAWER_WIDTH,
        borderRadius: 3,
        // borderBottomLeftRadius: 0,
        // borderBottomRightRadius: 0,
        overflow: 'hidden'
      }}
      border={1}
      borderColor="divider"
      data-testid="SettingsDrawer"
    >
      <DrawerTitle title={t('Social Share Preview')} onClose={onClose} />
      <Box sx={{ px: 6, py: 4 }} data-testid="SocialShareAppearance">
        <Typography variant="subtitle2" sx={{ pb: 4 }}>
          {t('Social Image')}
        </Typography>
        <ImageEdit />
        <TitleEdit />
        <DescriptionEdit />
      </Box>
    </Stack>
  )
}
