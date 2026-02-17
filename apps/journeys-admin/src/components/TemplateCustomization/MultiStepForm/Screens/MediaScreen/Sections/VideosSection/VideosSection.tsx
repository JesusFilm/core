import { useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { GET_JOURNEY } from '@core/journeys/ui/useJourneyQuery'

import {
  IdType,
  VideoBlockSource
} from '../../../../../../../../__generated__/globalTypes'
import { VIDEO_BLOCK_UPDATE } from '../../../../../../Editor/Slider/Settings/CanvasDetails/Properties/blocks/Video/Options/VideoOptions'
import { useVideoUpload } from '../../../../../utils/useVideoUpload/useVideoUpload'
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
}

function UploadButton({
  loading,
  open,
  getInputProps,
  label
}: UploadButtonProps): ReactElement {
  return (
    <Box sx={{ mt: 4 }}>
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
        <Typography
          variant="subtitle2"
          fontSize={14}
          sx={{ color: 'secondary.main' }}
        >
          {label}
        </Typography>
      </Button>
    </Box>
  )
}

interface VideoTitleProps {
  title: string
}

function VideoTitle({ title }: VideoTitleProps): ReactElement {
  return (
    <Typography
      variant="body2"
      sx={{
        mt: 4,
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
  onLoading?: (loading: boolean) => void
}

/**
 * Renders the Video section for the Media step: heading and the card's
 * customizable video preview (YouTube, Mux, or internal).
 */
export function VideosSection({
  cardBlockId,
  onLoading
}: VideosSectionProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const { enqueueSnackbar } = useSnackbar()
  const videoBlock = getCustomizableCardVideoBlock(journey, cardBlockId)
  const videoBlockDisplayTitle =
    videoBlock != null ? getVideoBlockDisplayTitle(videoBlock) : ''

  const [updating, setUpdating] = useState(false)
  const [videoBlockUpdate] = useMutation(VIDEO_BLOCK_UPDATE)

  const { open, getInputProps, status } = useVideoUpload({
    onUploadComplete: async (videoId) => {
      if (videoBlock == null || journey?.id == null) return
      setUpdating(true)
      try {
        await videoBlockUpdate({
          variables: {
            id: videoBlock.id,
            input: {
              videoId,
              source: VideoBlockSource.mux
            }
          },
          refetchQueries: [
            {
              query: GET_JOURNEY,
              variables: {
                id: journey.id,
                idType: IdType.databaseId,
                options: { skipRoutingFilter: true }
              }
            }
          ]
        })
        enqueueSnackbar(t('File uploaded successfully'), { variant: 'success' })
      } catch {
        enqueueSnackbar(t('Upload failed. Please try again'), { variant: 'error' })
      } finally {
        setUpdating(false)
      }
    },
    onUploadError: () => {
      enqueueSnackbar(t('Upload failed. Please try again'), { variant: 'error' })
    }
  })

  const loading = status === 'uploading' || status === 'processing' || updating

  useEffect(() => {
    onLoading?.(loading)
  }, [loading, onLoading])

  return (
    <Box data-testid="VideosSection" width="100%">
      <Typography
        variant="subtitle2"
        gutterBottom
        sx={{ color: 'text.secondary' }}
      >
        {t('Video')}
      </Typography>
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
      <UploadButton
        loading={loading}
        open={open}
        getInputProps={getInputProps}
        label={t('Upload file')}
      />
    </Box>
  )
}
