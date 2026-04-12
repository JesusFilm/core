import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ChangeEvent, ReactElement, useEffect, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { VideoBlockSource } from '../../../../../../../../__generated__/globalTypes'
import { useTemplateVideoUpload } from '../../../../TemplateVideoUploadProvider'
import {
  extractYouTubeVideoId,
  getCustomizableCardVideoBlock
} from '../../utils'

import { VideoPreviewPlayer } from './VideoPreviewPlayer'

interface UploadButtonProps {
  loading: boolean
  open: () => void
  getInputProps: () => Record<string, unknown>
  label: string
  errorMessage?: string
}

function UploadButton({
  loading,
  open,
  getInputProps,
  label,
  errorMessage
}: UploadButtonProps): ReactElement {
  return (
    <Box sx={{ py: 2 }}>
      <input {...getInputProps()} />
      <Button
        data-testid="VideosSection-upload-button"
        size="medium"
        color="secondary"
        variant="outlined"
        disabled={loading}
        onClick={open}
        sx={{
          borderWidth: 2,
          borderRadius: 2,
          height: 48,
          width: '100%',
          borderColor: 'secondary.light'
        }}
      >
        <Typography variant="subtitle2">{label}</Typography>
      </Button>
      {errorMessage != null && (
        <Typography
          variant="caption"
          sx={{
            color: 'error.main',
            mt: 0.5
          }}
        >
          {errorMessage}
        </Typography>
      )}
    </Box>
  )
}

interface VideoAdapterNoteProps {
  note: string
}

function VideoAdapterNote({ note }: VideoAdapterNoteProps): ReactElement {
  return (
    <Typography
      variant="subtitle3"
      color="text.secondary"
      sx={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical'
      }}
    >
      {note}
    </Typography>
  )
}

interface VideosSectionProps {
  cardBlockId: string | null
  showLabel?: boolean
}

/**
 * Renders the Video section for the Media step: heading and the card's
 * customizable video preview (YouTube, Mux, or internal).
 */
export function VideosSection({
  cardBlockId,
  showLabel = false
}: VideosSectionProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const { startUpload, startYouTubeLink, getUploadStatus } =
    useTemplateVideoUpload()

  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [youtubeUrlError, setYoutubeUrlError] = useState<string | undefined>(
    undefined
  )

  const videoBlock = getCustomizableCardVideoBlock(journey, cardBlockId)
  const adapterNote = videoBlock?.notes?.trim() ?? ''

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

  const lastSubmittedRef = useRef(new Map<string, string>())

  useEffect(() => {
    setYoutubeUrl('')
    setYoutubeUrlError(undefined)

    if (
      videoBlock != null &&
      videoBlock.source === VideoBlockSource.youTube &&
      videoBlock.videoId != null
    ) {
      const canonicalUrl = `https://www.youtube.com/watch?v=${videoBlock.videoId}`
      setYoutubeUrl(canonicalUrl)
      lastSubmittedRef.current.set(videoBlock.id, canonicalUrl)
    }
    // Only reset on card switch — adding videoBlock deps would re-fire
    // after every YouTube mutation (journey context updates videoId).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardBlockId])

  function handleYouTubeUrlChange(event: ChangeEvent<HTMLInputElement>): void {
    setYoutubeUrl(event.target.value)
    if (youtubeUrlError != null) setYoutubeUrlError(undefined)
  }

  useEffect(() => {
    const trimmedUrl = youtubeUrl.trim()
    if (trimmedUrl === '' || loading || videoBlock == null) return

    const timer = setTimeout(() => {
      const extractedId = extractYouTubeVideoId(trimmedUrl)
      if (extractedId == null) {
        setYoutubeUrlError(t('Please enter a valid YouTube URL'))
        return
      }
      setYoutubeUrlError(undefined)
      if (trimmedUrl === lastSubmittedRef.current.get(videoBlock.id)) return
      void startYouTubeLink(videoBlock.id, extractedId).then((success) => {
        if (success) {
          lastSubmittedRef.current.set(videoBlock.id, trimmedUrl)
        }
      })
    }, 800)

    return () => clearTimeout(timer)
  }, [youtubeUrl, loading, videoBlock, startYouTubeLink, t])

  return (
    <Stack data-testid="VideosSection" gap={2} width="100%">
      <Stack gap={2}>
        {showLabel && (
          <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
            {t('Video')}
          </Typography>
        )}
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
          {videoBlock != null && !loading && adapterNote !== '' && (
            <VideoAdapterNote note={adapterNote} />
          )}
        </Stack>
      </Stack>
      <UploadButton
        loading={loading}
        open={open}
        getInputProps={getInputProps}
        label={t('Upload File')}
        errorMessage={errorMessage}
      />
      <Divider>
        <Typography variant="caption" color="text.secondary">
          {t('or')}
        </Typography>
      </Divider>
      <TextField
        data-testid="VideosSection-youtube-input"
        variant="filled"
        hiddenLabel
        fullWidth
        placeholder={t('Paste a YouTube link...')}
        value={youtubeUrl}
        onChange={handleYouTubeUrlChange}
        disabled={loading}
        error={youtubeUrlError != null}
        helperText={
          youtubeUrlError ??
          t('youtube.com, youtu.be and shorts links supported')
        }
        inputProps={{ 'aria-label': t('YouTube URL') }}
      />
    </Stack>
  )
}
