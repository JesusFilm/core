import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { SxProps, Theme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import {
  ChangeEvent,
  FocusEvent,
  MouseEvent,
  ReactElement,
  useId,
  useState
} from 'react'

import { CollectionMediaValues } from '../useCollectionForm/collectionMedia'

import { MuxUploadField } from './MuxUploadField'

type MediaUiMode = 'mux' | 'link'

// Reserved height for the media input area. Every state — Link field, the empty
// upload prompt, an in-flight upload, the attached video — renders inside this
// fixed-height box so switching Link <-> Upload (or an upload moving through its
// states) never shifts the dialog layout. Sized to the tallest steady state
// (the link field plus its helper line).
const MEDIA_AREA_MIN_HEIGHT = 80

interface MediaSectionProps {
  media: CollectionMediaValues
  /** Inline error for the media field (schema or backend reason message). */
  error?: string
  /** Transient update — typing a link, an upload starting. No network. */
  onChange: (media: CollectionMediaValues) => void
  /**
   * Commit — the value is final, persist it now (out of band from the
   * dialog's Save). Fires on link blur, upload completion, and Remove. The
   * parent runs the immediate save and writes the normalized result back.
   */
  onCommit: (media: CollectionMediaValues) => void
  /** True while the parent is persisting a committed media value. */
  saving?: boolean
  /** Section-header typography, shared with the rest of the dialog. */
  headerSx: SxProps<Theme>
}

/** A `mux` row opens Upload; everything else (link / none) opens Link. */
function inferMode(media: CollectionMediaValues): MediaUiMode {
  return media.type === 'mux' ? 'mux' : 'link'
}

/**
 * Media editing surface for the CollectionDialog: a two-way picker — Link (any
 * embeddable URL: Canva, YouTube, Google Slides) or Upload (a Mux video). The
 * provider is inferred server-side from the URL host, so Link is a single
 * field; the backend validates and normalizes it. Media saves out of band from
 * the dialog (link on blur, upload on completion, Remove immediately), so
 * switching only changes which input is shown — it never wipes the saved media;
 * the active media is replaced only by committing a new link / upload or an
 * explicit Remove. The input lives in a fixed-height box so no state change
 * shifts the layout. Must be rendered inside a `MuxVideoUploadProvider`.
 */
export function MediaSection({
  media,
  error,
  onChange,
  onCommit,
  saving = false,
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
    // selection can't be toggled off. Switching only changes the visible
    // input; it never clears the saved media (the user can compare Upload vs
    // Link without losing it).
    if (next == null || next === mode) return
    setMode(next)
  }

  const linkValue = media.type === 'link' ? media.url : ''
  function handleUrlChange(event: ChangeEvent<HTMLInputElement>): void {
    const value = event.target.value
    onChange(
      value.trim() === '' ? { type: 'none' } : { type: 'link', url: value }
    )
  }
  // Commit the link the moment the field loses focus — read the DOM value
  // directly so the committed value can't lag a final keystroke. An empty
  // field commits `none` (clears the saved link).
  function handleUrlBlur(event: FocusEvent<HTMLInputElement>): void {
    const value = event.target.value
    onCommit(
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
    <Stack gap={1}>
      <Typography sx={headerSx}>{t('Media')}</Typography>

      {/* Full-width, equal-width toggle matching the app's media-source
          switches (e.g. BackgroundMedia's Image/Video). textTransform none so
          it reads "Link" / "Upload", not the bare size="small" caps group this
          used to be. */}
      <ToggleButtonGroup
        exclusive
        fullWidth
        value={mode}
        onChange={handleModeChange}
        aria-label={t('Media type')}
        disabled={saving}
        sx={{
          '& .MuiToggleButton-root': { textTransform: 'none', py: 1, mb: 1 }
        }}
      >
        <ToggleButton value="link" aria-label={t('Link')}>
          {t('Link')}
        </ToggleButton>
        <ToggleButton value="mux" aria-label={t('Upload')}>
          {t('Upload')}
        </ToggleButton>
      </ToggleButtonGroup>

      <Box sx={{ minHeight: MEDIA_AREA_MIN_HEIGHT }}>
        {mode === 'mux' ? (
          <MuxUploadField
            uploadKey={uploadKey}
            hasVideo={
              media.type === 'mux' &&
              (media.muxVideoId !== '' || savedPlaybackId != null)
            }
            playbackId={savedPlaybackId}
            // Preserve any existing playbackId so an in-flight *replacement*
            // upload still knows about the previously-saved video (so cancelling
            // reverts to it instead of clearing it). Start is transient; the
            // upload isn't saved until it completes.
            onUploadStart={() =>
              onChange({
                type: 'mux',
                muxVideoId: '',
                muxPlaybackId: savedPlaybackId
              })
            }
            // Completion is the commit point — persist the new video now.
            onComplete={(videoId, playbackId) =>
              onCommit({
                type: 'mux',
                muxVideoId: videoId,
                muxPlaybackId: playbackId
              })
            }
            // Cancel reverts (transient) to the prior saved video when one
            // existed, else none — nothing was persisted during the in-flight
            // upload, so there's nothing to save here.
            onCancel={() =>
              onChange(
                savedPlaybackId != null
                  ? {
                      type: 'mux',
                      muxVideoId: '',
                      muxPlaybackId: savedPlaybackId
                    }
                  : { type: 'none' }
              )
            }
            // Remove deletes the attached video — commit the cleared state.
            onRemove={() => onCommit({ type: 'none' })}
          />
        ) : (
          <TextField
            value={linkValue}
            onChange={handleUrlChange}
            onBlur={handleUrlBlur}
            disabled={saving}
            placeholder={t('Paste link')}
            fullWidth
            variant="filled"
            hiddenLabel
            inputProps={{ 'aria-label': t('Media link') }}
            error={error != null}
            helperText={
              error ?? t('We support YouTube, Canva, and Google Slides.')
            }
          />
        )}
      </Box>

      {/* Status line — gives the section a consistent bottom rhythm and keeps
          its height stable when "Saving…" toggles (also covers Upload mode,
          which has no helper-text line of its own). */}
      <Box sx={{ minHeight: 20 }}>
        {saving && (
          <Typography variant="caption" color="text.secondary">
            {t('Saving…')}
          </Typography>
        )}
      </Box>
    </Stack>
  )
}
