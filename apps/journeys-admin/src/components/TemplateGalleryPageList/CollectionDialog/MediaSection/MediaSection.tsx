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

type MediaUiMode = 'mux' | 'canva' | 'youtube'

// The union of YouTube hosts the normalizers recognize (watch/share + the
// nocookie embed a persisted link carries), used only to pick the initial
// picker tab. Exact-match — not a permissive `endsWith` that would match
// look-alike hosts like `notyoutube.com`. NOTE: this is intentionally broader
// than `embedAttrs` (which only sees post-normalization nocookie hosts) and
// `previewEmbedUrl` (watch hosts only) — do not "sync" the three.
const YOUTUBE_HOSTS = new Set([
  'youtu.be',
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com'
])

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

/**
 * Picks the initial picker tab from the persisted media. A `link` row is
 * disambiguated by its (normalized) URL host — YouTube hosts open the YouTube
 * tab, everything else (Canva, Slides, unknown) opens the Canva tab, which is
 * also the default for a brand-new (`none`) collection.
 */
function inferMode(media: CollectionMediaValues): MediaUiMode {
  if (media.type === 'mux') return 'mux'
  if (media.type === 'link') {
    try {
      const host = new URL(media.url).hostname.toLowerCase()
      if (YOUTUBE_HOSTS.has(host)) return 'youtube'
    } catch {
      // fall through to the Canva default
    }
    return 'canva'
  }
  return 'canva'
}

/**
 * Media editing surface for the CollectionDialog: a type picker (Video upload
 * / Canva / YouTube — Google Slides is intentionally not offered) with a
 * per-type input. Canva and YouTube both submit as `{ type: 'link', url }`;
 * the picker only chooses the input UI and helper copy. Switching type clears
 * the prior value (R12), and clearing only happens on explicit activation, not
 * focus traversal. Must be rendered inside a `MuxVideoUploadProvider`.
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

  // Canva and YouTube share one TextField; only the copy differs.
  const linkCopy =
    mode === 'youtube'
      ? {
          ariaLabel: t('YouTube link'),
          placeholder: t('Paste a YouTube link'),
          helper: t('Paste any YouTube link — watch, share, shorts, or embed.')
        }
      : {
          ariaLabel: t('Canva link'),
          placeholder: t('Paste a Canva design link'),
          helper: t(
            'Paste a Canva design link. In Canva: Share → set to Anyone with the link before pasting.'
          )
        }

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
        <ToggleButton value="mux" aria-label={t('Video upload')}>
          {t('Video upload')}
        </ToggleButton>
        <ToggleButton value="canva" aria-label={t('Canva')}>
          {t('Canva')}
        </ToggleButton>
        <ToggleButton value="youtube" aria-label={t('YouTube')}>
          {t('YouTube')}
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

      {mode !== 'mux' && (
        <TextField
          value={linkValue}
          onChange={handleUrlChange}
          onBlur={onBlur}
          placeholder={linkCopy.placeholder}
          fullWidth
          variant="filled"
          hiddenLabel
          inputProps={{ 'aria-label': linkCopy.ariaLabel }}
          error={error != null}
          helperText={error ?? linkCopy.helper}
        />
      )}
    </Stack>
  )
}
