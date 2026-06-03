import { useApolloClient } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ChangeEvent, ReactElement, useRef } from 'react'

import { GetMyMuxVideoQuery } from '../../../../../../__generated__/GetMyMuxVideoQuery'
import {
  GET_MY_MUX_VIDEO_QUERY,
  useMuxVideoUpload
} from '../../../../MuxVideoUploadProvider'

interface MuxUploadFieldProps {
  /** Stable key identifying this dialog's upload task in the provider. */
  uploadKey: string
  /** True when a video is already attached (fresh upload completed or an
   *  existing saved row). Drives the attached/empty rendering. */
  hasVideo: boolean
  /** Persisted playback id (edit mode) — renders a thumbnail. Fresh uploads
   *  have no playback id until after save. */
  playbackId?: string | null
  /** Fires the moment a file is chosen, before the upload completes — lets
   *  the parent mark the form's media as a pending mux upload so Save is
   *  gated until the upload finishes. */
  onUploadStart: () => void
  /** Fires when the provider confirms the upload is ready, with the new Mux
   *  video id and its playback id (read from the provider's poll cache so the
   *  preview can render a thumbnail immediately, before the row is saved). */
  onComplete: (videoId: string, playbackId: string | null) => void
  /** Aborts an in-flight upload and reverts the form to its prior committed
   *  media (the previously-saved video, or none). Distinct from `onRemove`,
   *  which deletes an already-attached video. */
  onCancel: () => void
  /** Deletes the attached video from the form (Remove button). */
  onRemove: () => void
}

/**
 * File-upload control over `MuxVideoUploadProvider`, scoped to the collection
 * dialog. Surfaces upload progress, the post-upload processing state, errors,
 * and the attached/ready state. Readiness is captured from the provider's
 * `onComplete(videoId)` callback (the provider fires it only after it has
 * confirmed `readyToStream` internally) — there is no `readyToStream` field on
 * the upload task, and the task is removed shortly after completion, so the
 * durable signal is the captured video id, lifted to the form by the parent.
 */
export function MuxUploadField({
  uploadKey,
  hasVideo,
  playbackId,
  onUploadStart,
  onComplete,
  onCancel,
  onRemove
}: MuxUploadFieldProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { getUploadStatus, addUploadTask, cancelUploadForBlock } =
    useMuxVideoUpload()
  const client = useApolloClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const task = getUploadStatus(uploadKey)

  // The provider polls `getMyMuxVideo` (network-only) until ready, so by the
  // time it fires the completion callback the playbackId is in the Apollo
  // cache. Read it here and pass it up so the preview can show the thumbnail
  // immediately, without waiting for the save round-trip.
  function handleComplete(videoId: string): void {
    const cached = client.readQuery<GetMyMuxVideoQuery>({
      query: GET_MY_MUX_VIDEO_QUERY,
      variables: { id: videoId }
    })
    onComplete(videoId, cached?.getMyMuxVideo?.playbackId ?? null)
  }

  function handlePick(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0]
    // Reset the input so re-selecting the same file fires onChange again.
    event.target.value = ''
    if (file == null) return
    // Abort any prior in-flight upload for this key before starting a new
    // one, so a quick re-pick doesn't leave two pipelines racing to set the
    // form's muxVideoId.
    cancelUploadForBlock({ id: uploadKey })
    onUploadStart()
    addUploadTask(uploadKey, file, undefined, undefined, handleComplete)
  }

  function handleCancel(): void {
    cancelUploadForBlock({ id: uploadKey })
    onCancel()
  }

  function openPicker(): void {
    inputRef.current?.click()
  }

  const status = task?.status
  const uploading = status === 'uploading'
  const processing = status === 'processing'
  const errored = status === 'error'

  return (
    <Box>
      <Box
        component="input"
        ref={inputRef}
        type="file"
        accept="video/*"
        data-testid="MuxUploadFieldInput"
        onChange={handlePick}
        sx={{ display: 'none' }}
        aria-hidden="true"
      />

      {uploading && (
        <Stack spacing={1} data-testid="MuxUploadFieldUploading">
          <Typography variant="body2">{t('Uploading video…')}</Typography>
          <LinearProgress variant="determinate" value={task?.progress ?? 0} />
          <Button size="small" color="error" onClick={handleCancel}>
            {t('Cancel')}
          </Button>
        </Stack>
      )}

      {processing && (
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          data-testid="MuxUploadFieldProcessing"
        >
          <CircularProgress size={20} />
          <Typography variant="body2">{t('Processing video…')}</Typography>
          <Button size="small" color="error" onClick={handleCancel}>
            {t('Cancel')}
          </Button>
        </Stack>
      )}

      {errored && (
        <Stack spacing={1} data-testid="MuxUploadFieldError">
          <Typography variant="body2" color="error">
            {t('Upload failed. Try another file.')}
          </Typography>
          <Button size="small" variant="outlined" onClick={openPicker}>
            {t('Try again')}
          </Button>
        </Stack>
      )}

      {!uploading && !processing && !errored && hasVideo && (
        // Compact attached state: a small 16:9 thumbnail beside the actions so
        // the whole row fits the section's reserved height (the wide editing
        // column made a full-size thumbnail dominate the dialog, and the left
        // preview pane already shows the video at full size).
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          data-testid="MuxUploadFieldReady"
        >
          {playbackId != null && playbackId !== '' ? (
            <Box
              sx={{
                width: 96,
                flexShrink: 0,
                aspectRatio: '16 / 9',
                borderRadius: 1,
                overflow: 'hidden'
              }}
            >
              <Box
                component="img"
                src={`https://image.mux.com/${playbackId}/thumbnail.jpg`}
                alt={t('Video thumbnail')}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            </Box>
          ) : (
            <Typography variant="body2">{t('Video ready')}</Typography>
          )}
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="outlined" onClick={openPicker}>
              {t('Replace')}
            </Button>
            <Button size="small" color="error" onClick={onRemove}>
              {t('Remove')}
            </Button>
          </Stack>
        </Stack>
      )}

      {!uploading && !processing && !errored && !hasVideo && (
        <Stack spacing={0.5} alignItems="flex-start">
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            onClick={openPicker}
            data-testid="MuxUploadFieldPick"
          >
            {t('Choose a video')}
          </Button>
          <Typography variant="caption" color="text.secondary">
            {t('MP4 or MOV, up to 1 GB.')}
          </Typography>
        </Stack>
      )}
    </Box>
  )
}
