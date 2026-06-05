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
import { MediaPreview } from '../../MediaPreview'
import { CollectionMediaValues } from '../../useCollectionForm/collectionMedia'
import { MediaFieldFrame } from '../MediaFieldFrame'

interface MuxUploadFieldProps {
  /** Stable key identifying this dialog's upload task in the provider. */
  uploadKey: string
  /** Box preview value (the mux media or none) — drives the left thumbnail. */
  media: CollectionMediaValues
  /** True when a video is already attached (fresh upload completed or an
   *  existing saved row). Drives the attached/empty rendering. */
  hasVideo: boolean
  /** Fires the moment a file is chosen, before the upload completes — lets
   *  the parent mark the form's media as a pending mux upload so Save is
   *  gated until the upload finishes. */
  onUploadStart: () => void
  /** Fires when the provider confirms the upload is ready, with the new Mux
   *  video id, its playback id, and its name/duration metadata (all read from
   *  the provider's poll cache so the preview can render a thumbnail and show
   *  the metadata immediately, before the row is saved). The metadata is passed
   *  up under the row's `muxName`/`muxDuration` names it will be denormalized to. */
  onComplete: (
    videoId: string,
    playbackId: string | null,
    muxName: string | null,
    muxDuration: number | null
  ) => void
  /** Aborts an in-flight upload and reverts the form to its prior committed
   *  media (the previously-saved video, or none). Distinct from `onRemove`,
   *  which deletes an already-attached video. */
  onCancel: () => void
  /** Deletes the attached video from the form (Remove button). */
  onRemove: () => void
}

/** Formats a Mux duration (seconds) as `m:ss` for the attached-video label. */
function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Upload control over `MuxVideoUploadProvider`, scoped to the collection
 * dialog. Renders the shared `[preview box | control]` row: the box (a clickable
 * `MediaFieldFrame`) is Choose / Replace, and the right column surfaces upload
 * progress, the post-upload processing state, errors, and the attached state.
 * Readiness is captured from the provider's `onComplete(videoId)` callback (the
 * provider fires it only after confirming `readyToStream` internally) — there is
 * no `readyToStream` field on the upload task, and the task is removed shortly
 * after completion, so the durable signal is the captured video id.
 */
export function MuxUploadField({
  uploadKey,
  media,
  hasVideo,
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
  // time it fires the completion callback the playbackId, name, and duration
  // are in the Apollo cache. Read them here and pass them up so the preview can
  // show the thumbnail and metadata immediately, without waiting for the save
  // round-trip.
  function handleComplete(videoId: string): void {
    const cached = client.readQuery<GetMyMuxVideoQuery>({
      query: GET_MY_MUX_VIDEO_QUERY,
      variables: { id: videoId }
    })
    onComplete(
      videoId,
      cached?.getMyMuxVideo?.playbackId ?? null,
      cached?.getMyMuxVideo?.name ?? null,
      cached?.getMyMuxVideo?.duration ?? null
    )
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

  // Attached-state metadata. muxName/muxDuration come either from a fresh
  // upload's onComplete (provider cache) or from an existing saved row
  // (denormalized on the media read model). Fall back to a generic label when
  // Mux has no name.
  const videoName =
    media.type === 'mux' && media.muxName != null && media.muxName !== ''
      ? media.muxName
      : t('Video attached')
  const videoDuration = media.type === 'mux' ? media.muxDuration : null

  return (
    <>
      {/* Kept out of the Stack so its (display:none) slot doesn't push the
          preview right via the Stack's spacing. */}
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
      <Stack direction="row" spacing={2} alignItems="center">
        {/* Box = Choose / Replace (clickable, with the edit affordance). */}
        <MediaFieldFrame
          onEdit={openPicker}
          editLabel={hasVideo ? t('Replace video') : t('Choose a video')}
        >
          {/* 56×56 preview matching the creator-details image. */}
          <Box sx={{ width: 56, height: 56, flexShrink: 0 }}>
            <MediaPreview media={media} compact fill />
          </Box>
        </MediaFieldFrame>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          {uploading && (
            <Stack spacing={1} data-testid="MuxUploadFieldUploading">
              <Typography variant="body2">{t('Uploading video…')}</Typography>
              <LinearProgress
                variant="determinate"
                value={task?.progress ?? 0}
              />
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
            // Attached: name + duration on the left, Remove floated to the end.
            // Replace lives in the box's edit affordance.
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="space-between"
              data-testid="MuxUploadFieldReady"
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" noWrap>
                  {videoName}
                </Typography>
                {videoDuration != null && (
                  <Typography variant="caption" color="text.secondary">
                    {formatDuration(videoDuration)}
                  </Typography>
                )}
              </Box>
              <Button size="small" color="error" onClick={onRemove}>
                {t('Remove')}
              </Button>
            </Stack>
          )}

          {!uploading && !processing && !errored && !hasVideo && (
            <Typography variant="caption" color="text.secondary">
              {t('Click the box to upload a video. MP4 or MOV, up to 1 GB.')}
            </Typography>
          )}
        </Box>
      </Stack>
    </>
  )
}
