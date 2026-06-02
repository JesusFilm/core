import Stack from '@mui/material/Stack'
import { SxProps, Theme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ChangeEvent, MouseEvent, ReactElement, useId, useState } from 'react'

import { CollectionMediaValues } from '../useCollectionForm/collectionMedia'

import { MuxUploadField } from './MuxUploadField'

type MediaUiMode = 'mux' | 'link'

interface MediaSectionProps {
  media: CollectionMediaValues
  /** Inline error for the media field (schema or backend reason message). */
  error?: string
  /** Updates the form's media value. */
  onChange: (media: CollectionMediaValues) => void
  /** Marks the media field touched (URL blur). */
  onBlur: () => void
  /** Section-header typography, shared with the rest of the dialog. */
  headerSx: SxProps<Theme>
}

/** A `mux` row opens the Upload tab; everything else (link / none) opens Link. */
function inferMode(media: CollectionMediaValues): MediaUiMode {
  return media.type === 'mux' ? 'mux' : 'link'
}

/**
 * Media editing surface for the CollectionDialog: a two-way picker — Upload (a
 * Mux video) or Link (any embeddable URL: Canva, YouTube, …). The provider is
 * inferred server-side from the URL host, so Link is a single field; the
 * backend validates and normalizes it. Switching type clears the prior value
 * (R12), and clearing only happens on explicit activation, not focus traversal.
 * Must be rendered inside a `MuxVideoUploadProvider`.
 */
export function MediaSection({
  media,
  error,
  onChange,
  onBlur,
  headerSx
}: MediaSectionProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  // Stable per-dialog upload key in place of the editor's videoBlockId.
  const uploadKey = useId()
  const [mode, setMode] = useState<MediaUiMode>(() => inferMode(media))

  function handleModeChange(
    _event: MouseEvent<HTMLElement>,
    next: MediaUiMode | null
  ): void {
    // `next` is null when the active button is re-clicked — ignore so the
    // selection can't be toggled off. Only an actual switch clears state.
    if (next == null || next === mode) return
    setMode(next)
    onChange({ type: 'none' })
  }

  const linkValue = media.type === 'link' ? media.url : ''
  function handleUrlChange(event: ChangeEvent<HTMLInputElement>): void {
    const value = event.target.value
    onChange(
      value.trim() === '' ? { type: 'none' } : { type: 'link', url: value }
    )
  }

  // The previously-saved video, if any — the read model exposes only a
  // playbackId (never the original muxVideoId), so this both marks the row as
  // already-saved and is the value an in-flight replacement reverts to.
  const savedPlaybackId =
    media.type === 'mux' &&
    media.muxPlaybackId != null &&
    media.muxPlaybackId !== ''
      ? media.muxPlaybackId
      : null

  return (
    <Stack spacing={1}>
      <Typography sx={headerSx}>{t('Media')}</Typography>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={mode}
        onChange={handleModeChange}
        aria-label={t('Media type')}
      >
        <ToggleButton value="mux" aria-label={t('Upload')}>
          {t('Upload')}
        </ToggleButton>
        <ToggleButton value="link" aria-label={t('Link')}>
          {t('Link')}
        </ToggleButton>
      </ToggleButtonGroup>

      {mode === 'mux' && (
        <MuxUploadField
          uploadKey={uploadKey}
          hasVideo={
            media.type === 'mux' &&
            (media.muxVideoId !== '' || savedPlaybackId != null)
          }
          playbackId={savedPlaybackId}
          // Preserve any existing playbackId so an in-flight *replacement*
          // upload still knows about the previously-saved video (so cancelling
          // reverts to it instead of clearing it).
          onUploadStart={() =>
            onChange({ type: 'mux', muxVideoId: '', muxPlaybackId: savedPlaybackId })
          }
          onComplete={(videoId) =>
            onChange({ type: 'mux', muxVideoId: videoId })
          }
          // Cancel reverts to the prior saved video when one existed, else none.
          onCancel={() =>
            onChange(
              savedPlaybackId != null
                ? { type: 'mux', muxVideoId: '', muxPlaybackId: savedPlaybackId }
                : { type: 'none' }
            )
          }
          onRemove={() => onChange({ type: 'none' })}
        />
      )}

      {mode === 'link' && (
        <TextField
          value={linkValue}
          onChange={handleUrlChange}
          onBlur={onBlur}
          placeholder={t('Paste a Canva or YouTube link')}
          fullWidth
          variant="filled"
          hiddenLabel
          inputProps={{ 'aria-label': t('Media link') }}
          error={error != null}
          helperText={
            error ??
            t('Paste a Canva or YouTube link. In Canva, set Share → Anyone with the link first.')
          }
        />
      )}
    </Stack>
  )
}
