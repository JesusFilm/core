import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import Plus2Icon from '@core/shared/ui/icons/Plus2'
import VideoOnIcon from '@core/shared/ui/icons/VideoOn'

import { ImageBlockThumbnail } from '../../../ImageBlockThumbnail'

export function SourceEmpty(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <>
      <Box sx={{ ml: 2, mr: 4 }}>
        <ImageBlockThumbnail Icon={VideoOnIcon} />
      </Box>
      <Box flexGrow={1} minWidth={0}>
        <Typography variant="subtitle2" color="text.secondary">
          {t('Select Video')}
        </Typography>
      </Box>
      <IconButton disabled sx={{ mr: 2 }}>
        <Plus2Icon color="primary" />
      </IconButton>
    </>
  )
}
