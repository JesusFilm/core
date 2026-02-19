import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { useDropzone } from 'react-dropzone'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { useTemplateVideoUpload } from '../../../../TemplateVideoUploadProvider'
import {
  getCustomizableCardVideoBlock,
  getVideoBlockDisplayTitle
} from '../../utils'

import { VideoPreviewPlayer } from './VideoPreviewPlayer'

interface UploadButtonProps {
  loading: boolean
  open: () => void
  getInputProps: () => Record<string, unknown>
  label: string
  defaultMessage: string
  errorMessage?: string
}

function UploadButton({
  loading,
  open,
  getInputProps,
  label,
  defaultMessage,
  errorMessage
}: UploadButtonProps): ReactElement {
  const displayMessage = errorMessage ?? defaultMessage
  const isError = errorMessage != null

  return (
    <Box sx={{ py: 2 }}>
      <input {...getInputProps()} />
      <Button
        size="small"
        color="secondary"
        variant="outlined"
        disabled={loading}
        onClick={open}
        sx={{
          height: 32,
          width: '100%',
          borderRadius: 2
        }}
      >
        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
          {label}
        </Typography>
      </Button>
      <Typography
        variant="caption"
        sx={{
          color: isError ? 'error.main' : 'text.secondary',
          mt: 0.5
        }}
      >
        {displayMessage}
      </Typography>
    </Box>
  )
}

interface VideoTitleProps {
  title: string
}

function VideoTitle({ title }: VideoTitleProps): ReactElement {
  return (
    <Typography
      variant="subtitle3"
      color="text.secondary"
      sx={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}
    >
      {title}
    </Typography>
  )
}

interface VideosSectionProps {
  cardBlockId: string | null
}

/**
 * Renders the Video section for the Media step: heading and the card's
 * customizable video preview (YouTube, Mux, or internal).
 */
export function VideosSection({
  cardBlockId
}: VideosSectionProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const { startUpload, getUploadStatus } = useTemplateVideoUpload()

  const videoBlock = getCustomizableCardVideoBlock(journey, cardBlockId)
  const videoBlockDisplayTitle =
    videoBlock != null ? getVideoBlockDisplayTitle(videoBlock) : ''

  const uploadStatus =
    videoBlock != null ? getUploadStatus(videoBlock.id) : null
  const loading =
    uploadStatus != null &&
    (uploadStatus.status === 'uploading' ||
      uploadStatus.status === 'processing' ||
      uploadStatus.status === 'updating')
  const errorMessage =
    uploadStatus?.status === 'error' ? uploadStatus.error : undefined

  const { open, getInputProps } = useDropzone({
    onDropAccepted: (files) => {
      if (videoBlock != null && files[0] != null) {
        startUpload(videoBlock.id, files[0])
      }
    },
    noDrag: true,
    multiple: false,
    accept: { 'video/*': [] },
    disabled: loading
  })

  return (
    <Stack data-testid="VideosSection" gap={2} width="100%">
      <Stack gap={2}>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
          {t('Video')}
        </Typography>
        <Stack gap={1.5}>
          {loading ? (
            <Box
              sx={{
                width: '100%',
                aspectRatio: '16/9',
                bgcolor: 'background.default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 3
              }}
            >
              <CircularProgress size={24} />
            </Box>
          ) : (
            videoBlock != null && <VideoPreviewPlayer videoBlock={videoBlock} />
          )}
          {videoBlock != null && !loading && videoBlockDisplayTitle !== '' && (
            <VideoTitle title={videoBlockDisplayTitle} />
          )}
        </Stack>
      </Stack>
      <UploadButton
        loading={loading}
        open={open}
        getInputProps={getInputProps}
        label={t('Upload File')}
        defaultMessage={t('Max size is 1 GB')}
        errorMessage={errorMessage}
      />
    </Stack>
  )
}
