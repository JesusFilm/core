import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import VideoOnIcon from '@core/shared/ui/icons/VideoOn'

import { BlockFields_VideoBlock as VideoBlock } from '../../../../../../../../../__generated__/BlockFields'
import { ImageBlockThumbnail } from '../../../ImageBlockThumbnail'

interface SourceFromCloudflareProps {
  selectedBlock: TreeBlock<VideoBlock>
}

export function SourceFromCloudflare({
  selectedBlock
}: SourceFromCloudflareProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const IMG_HEIGHT = 56
  const IMG_WIDTH = 56
  return (
    <>
      <Box sx={{ ml: 2, mr: 4 }}>
        <ImageBlockThumbnail
          selectedBlock={{
            src: `https://customer-${
              process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE ?? ''
            }.cloudflarestream.com/${
              selectedBlock.videoId ?? ''
            }/thumbnails/thumbnail.jpg?time=2s&height=${IMG_HEIGHT}&width=${IMG_WIDTH}`,
            alt: selectedBlock.title ?? ''
          }}
          Icon={VideoOnIcon}
        />
      </Box>
      <Box flexGrow={1} minWidth={0}>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden'
          }}
        >
          {selectedBlock.title}
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden'
          }}
        >
          {t('Custom Video')}
        </Typography>
      </Box>
      <IconButton disabled sx={{ mr: 2 }}>
        <Edit2Icon color="primary" />
      </IconButton>
    </>
  )
}
