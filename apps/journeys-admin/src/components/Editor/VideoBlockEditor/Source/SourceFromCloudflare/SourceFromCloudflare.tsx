import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import type { TreeBlock } from '@core/journeys/ui/block'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import VideoOnIcon from '@core/shared/ui/icons/VideoOn'

import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../../__generated__/GetJourney'
import { ImageBlockThumbnail } from '../../../ImageBlockThumbnail'

interface SourceFromCloudflareProps {
  selectedBlock: TreeBlock<VideoBlock>
}

export function SourceFromCloudflare({
  selectedBlock
}: SourceFromCloudflareProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <>
      <Box>
        <ImageBlockThumbnail
          selectedBlock={{
            src: `https://customer-${
              process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE ?? ''
            }.cloudflarestream.com/${
              selectedBlock.videoId ?? ''
            }/thumbnails/thumbnail.jpg?time=2s&height=55&width=55`,
            alt: selectedBlock.title ?? ''
          }}
          Icon={VideoOnIcon}
        />
      </Box>
      <Box flexGrow={1} minWidth={0}>
        <Typography
          variant="subtitle2"
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
          sx={{
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden'
          }}
        >
          {t('Custom Video')}
        </Typography>
      </Box>
      <Edit2Icon color="primary" />
    </>
  )
}
