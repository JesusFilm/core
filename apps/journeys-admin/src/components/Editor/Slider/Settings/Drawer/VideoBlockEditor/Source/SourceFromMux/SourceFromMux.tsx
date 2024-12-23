import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import VideoOnIcon from '@core/shared/ui/icons/VideoOn'

import { BlockFields_VideoBlock as VideoBlock } from '../../../../../../../../../__generated__/BlockFields'
import { useBackgroundUpload } from '../../../../../../BackgroundUpload'
import { UploadStatus } from '../../../../../../BackgroundUpload/BackgroundUploadContext'
import { ImageBlockThumbnail } from '../../../ImageBlockThumbnail'

interface SourceFromMuxProps {
  selectedBlock: TreeBlock<VideoBlock>
}

export function SourceFromMux({
  selectedBlock
}: SourceFromMuxProps): ReactElement {
  const IMG_HEIGHT = 56
  const IMG_WIDTH = 56
  const { uploadQueue } = useBackgroundUpload()
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <>
      {uploadQueue[selectedBlock.videoId ?? ''] == null ||
      uploadQueue[selectedBlock.videoId ?? '']?.status ===
        UploadStatus.complete ? (
        // eslint-disable-next-line react/jsx-indent
        <>
          <Box sx={{ ml: 2, mr: 4 }}>
            <ImageBlockThumbnail
              selectedBlock={{
                src: `${selectedBlock.image ?? ''}&width=${IMG_WIDTH}&height=${IMG_HEIGHT}`,
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
      ) : (
        <>
          {[UploadStatus.uploading, UploadStatus.processing].includes(
            uploadQueue[selectedBlock.videoId ?? ''].status
          ) && (
            <Box sx={{ width: '100%', mt: 4 }}>
              <Typography variant="body1" sx={{ pb: 4 }} color="secondary.main">
                {uploadQueue[selectedBlock.videoId ?? ''].status ===
                UploadStatus.uploading
                  ? t('Uploading...')
                  : t('Processing...')}
              </Typography>
              <LinearProgress
                variant={
                  uploadQueue[selectedBlock.videoId ?? ''].status ===
                  UploadStatus.processing
                    ? 'indeterminate'
                    : 'determinate'
                }
                value={uploadQueue[selectedBlock.videoId ?? ''].progress}
                sx={{ height: 32, borderRadius: 2 }}
              />
            </Box>
          )}
        </>
      )}
    </>
  )
}
