import { useApolloClient } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ChangeEvent, ReactElement, useEffect, useRef, useState } from 'react'

import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'

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
  /** True while the dialog is saving — locks the picker and actions so a
   *  file can't be chosen mid-submit (which would mutate form state after
   *  the mutation snapshotted it). */
  disabled?: boolean
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
  onRemove,
  disabled = false
}: MuxUploadFieldProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { getUploadStatus, addUploadTask, cancelUploadForBlock } =
    useMuxVideoUpload()
  const client = useApolloClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const task = getUploadStatus(uploadKey)

  // Sticky failure flag: the provider deletes errored tasks ~1s after the
  // failure (TASK_CLEANUP_DELAY), which would make the error UI — and its
  // Remove escape hatch — vanish while the form still holds the incomplete
  // mux value that blocks Save. Latch the error locally until the user
  // acts (retry or remove).
  const [uploadFailed, setUploadFailed] = useState(false)
  const status = task?.status
  useEffect(() => {
    if (status === 'error') setUploadFailed(true)
  }, [status])

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
    if (file == null || disabled) return
    // Abort any prior in-flight upload for this key before starting a new
    // one, so a quick re-pick doesn't leave two pipelines racing to set the
    // form's muxVideoId.
    cancelUploadForBlock({ id: uploadKey })
    setUploadFailed(false)
    onUploadStart()
    addUploadTask(uploadKey, file, undefined, undefined, handleComplete)
  }

  function handleCancel(): void {
    cancelUploadForBlock({ id: uploadKey })
    onCancel()
  }

  // Clears the failed upload from the form entirely (→ none), unblocking
  // Save. Label-accurate even after a failed replacement: Remove removes.
  function handleErrorRemove(): void {
    cancelUploadForBlock({ id: uploadKey })
    setUploadFailed(false)
    onRemove()
  }

  function openPicker(): void {
    if (disabled) return
    inputRef.current?.click()
  }

  const uploading = status === 'uploading'
  const processing = status === 'processing'
  const errored = status === 'error' || uploadFailed

  // Attached-state metadata. muxName/muxDuration come either from a fresh
  // upload's onComplete (provider cache) or from an existing saved row
  // (denormalized on the media read model). Fall back to a generic label when
  // Mux has no name.
  const videoName =
    media.muxName != null && media.muxName !== ''
      ? media.muxName
      : t('Video attached')
  // Finite-guard: a corrupt/partial Mux metadata read could surface NaN,
  // which passes a bare null check and would render "NaN:NaN".
  const videoDuration = Number.isFinite(media.muxDuration ?? NaN)
    ? media.muxDuration
    : null

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
      <Stack direction="row" spacing={2} alignItems="flex-start">
        {/* Box = Choose / Replace (clickable, with the edit affordance). */}
        <MediaFieldFrame
          onEdit={openPicker}
          editLabel={hasVideo ? t('Replace video') : t('Choose a video')}
          disabled={disabled}
        >
          {/* Inner preview fills the frame's padded area (even border all
              round), matching the creator-details image. */}
          <Box sx={{ width: '100%', height: '100%' }}>
            <MediaPreview media={media} compact fill />
          </Box>
        </MediaFieldFrame>

        {/* Right column: every state stacks its text with its action button
            directly underneath (natural flow, no bottom pinning). aria-live
            announces the async upload-state changes to assistive tech. */}
        <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }} aria-live="polite">
          {uploading && (
            <>
              <Stack spacing={1} data-testid="MuxUploadFieldUploading">
                <Typography variant="body2">{t('Uploading video…')}</Typography>
                <LinearProgress
                  variant="determinate"
                  value={task?.progress ?? 0}
                />
              </Stack>
              <Button
                size="small"
                color="error"
                onClick={handleCancel}
                sx={{ alignSelf: 'flex-start' }}
              >
                {t('Cancel')}
              </Button>
            </>
          )}

          {processing && (
            <>
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                data-testid="MuxUploadFieldProcessing"
              >
                <CircularProgress size={20} />
                <Typography variant="body2">
                  {t('Processing video…')}
                </Typography>
              </Stack>
              <Button
                size="small"
                color="error"
                onClick={handleCancel}
                sx={{ alignSelf: 'flex-start' }}
              >
                {t('Cancel')}
              </Button>
            </>
          )}

          {errored && (
            <>
              <Typography
                variant="body2"
                color="error"
                data-testid="MuxUploadFieldError"
              >
                {t('Upload failed. Try another file.')}
              </Typography>
              {/* Remove gives an escape hatch out of the errored mux state —
                  without it the form's media stays an incomplete mux value
                  that blocks Save indefinitely (the user's only other way
                  out would be a successful upload or typing a link). */}
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={openPicker}
                  disabled={disabled}
                >
                  {t('Try again')}
                </Button>
                <Button
                  size="small"
                  color="error"
                  onClick={handleErrorRemove}
                  disabled={disabled}
                >
                  {t('Remove')}
                </Button>
              </Stack>
            </>
          )}

          {!uploading && !processing && !errored && (
            // Steady states (attached / empty): text on top, Remove pinned
            // below. Remove is always rendered — disabled when there's nothing
            // to remove — so toggling between the states never shifts layout.
            // Replace lives in the box's edit affordance.
            <>
              <Box
                // 8px push-down so the text sits level with the frame rather
                // than hugging the row's top edge (theme spacing unit is 4px).
                sx={{ minWidth: 0, pt: 2 }}
                data-testid={
                  hasVideo ? 'MuxUploadFieldReady' : 'MuxUploadFieldEmpty'
                }
              >
                {hasVideo ? (
                  <>
                    <Typography variant="body2" noWrap>
                      {videoName}
                    </Typography>
                    {videoDuration != null && (
                      <Typography variant="caption" color="text.secondary">
                        {secondsToTimeFormat(videoDuration, {
                          trimZeroes: true
                        })}
                      </Typography>
                    )}
                  </>
                ) : (
                  // Empty upload slot is valid now (renders nothing on the
                  // public page), so there's no stuck/blocked state — just the
                  // prompt to upload.
                  <Typography variant="caption" color="text.secondary">
                    {t('Click the box to upload a video. MP4 or MOV, up to 1 GB.')}
                  </Typography>
                )}
              </Box>
              <Button
                size="small"
                color="error"
                onClick={onRemove}
                disabled={disabled || !hasVideo}
                sx={{ alignSelf: 'flex-start' }}
              >
                {t('Remove')}
              </Button>
            </>
          )}
        </Stack>
      </Stack>
    </>
  )
}
