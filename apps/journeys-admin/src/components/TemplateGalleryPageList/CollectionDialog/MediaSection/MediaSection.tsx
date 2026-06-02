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
      if (
        host === 'youtu.be' ||
        host.endsWith('youtube.com') ||
        host.endsWith('youtube-nocookie.com')
      ) {
        return 'youtube'
      }
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
            (media.muxVideoId !== '' ||
              (media.muxPlaybackId != null && media.muxPlaybackId !== ''))
          }
          playbackId={media.type === 'mux' ? media.muxPlaybackId : null}
          onUploadStart={() => onChange({ type: 'mux', muxVideoId: '' })}
          onComplete={(videoId) =>
            onChange({ type: 'mux', muxVideoId: videoId })
          }
          onRemove={() => onChange({ type: 'none' })}
        />
      )}

      {mode === 'canva' && (
        <TextField
          value={linkValue}
          onChange={handleUrlChange}
          onBlur={onBlur}
          placeholder={t('Paste a Canva design link')}
          fullWidth
          variant="filled"
          hiddenLabel
          inputProps={{ 'aria-label': t('Canva link') }}
          error={error != null}
          helperText={
            error ??
            t(
              'Paste a Canva design link. In Canva: Share → set to Anyone with the link before pasting.'
            )
          }
        />
      )}

      {mode === 'youtube' && (
        <TextField
          value={linkValue}
          onChange={handleUrlChange}
          onBlur={onBlur}
          placeholder={t('Paste a YouTube link')}
          fullWidth
          variant="filled"
          hiddenLabel
          inputProps={{ 'aria-label': t('YouTube link') }}
          error={error != null}
          helperText={
            error ??
            t('Paste any YouTube link — watch, share, shorts, or embed.')
          }
        />
      )}
    </Stack>
  )
}
