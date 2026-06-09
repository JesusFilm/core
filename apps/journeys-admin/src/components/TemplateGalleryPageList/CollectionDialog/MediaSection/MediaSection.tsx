import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { SxProps, Theme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ChangeEvent, MouseEvent, ReactElement } from 'react'

import { TemplateGalleryPageMediaType } from '../../../../../__generated__/globalTypes'
import {
  MEDIA_BOX_HEIGHT,
  MEDIA_BOX_WIDTH,
  MediaPreview
} from '../MediaPreview'
import { CollectionMediaValues } from '../useCollectionForm/collectionMedia'

import { MuxUploadField } from './MuxUploadField'

interface MediaSectionProps {
  media: CollectionMediaValues
  /** Stable per-dialog upload key, owned by the dialog so it can read the
   *  in-flight status and abort the upload from its discard flow. */
  uploadKey: string
  /** Inline error for the media field (schema or backend reason message). */
  error?: string
  /**
   * Form-state update — switching the active type, typing/clearing a link, an
   * upload starting/completing/being removed. No network: every media value
   * persists with the dialog's Save button.
   */
  onChange: (media: CollectionMediaValues) => void
  /** True while the dialog is saving — disables the media inputs. */
  saving?: boolean
  /** True while a Mux upload is in flight — locks the Link/Upload/None toggle so
   *  the user can't switch mid-upload (which would race completion). The dialog
   *  also blocks Save and routes Cancel through the discard prompt while this
   *  holds. */
  disableModeSwitch?: boolean
  /** Section-header typography, shared with the rest of the dialog. */
  headerSx: SxProps<Theme>
}

/**
 * Media editing surface for the CollectionDialog. The `Link / Upload / None`
 * toggle selects which payload renders (`media.type`); the link slot (`url`)
 * and the upload slot (`muxVideoId`/`muxPlaybackId`/…) are retained
 * independently, so switching the toggle never wipes the parked slot. Every
 * change is form state persisted by the dialog's Save button. Nothing is
 * implicit: the toggle is the ONLY thing that changes `type`; clearing or
 * removing a slot clears only that slot. Must be rendered inside a
 * `MuxVideoUploadProvider`.
 */
export function MediaSection({
  media,
  uploadKey,
  error,
  onChange,
  saving = false,
  disableModeSwitch = false,
  headerSx
}: MediaSectionProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  function handleTypeChange(
    _event: MouseEvent<HTMLElement>,
    next: TemplateGalleryPageMediaType | null
  ): void {
    // `next` is null when the active button is re-clicked — ignore so the
    // selection can't be toggled off. Setting the type retains both slots.
    if (next == null || next === media.type) return
    onChange({ ...media, type: next })
  }

  // Link slot editors — touch only `url`, never `type`.
  function handleUrlChange(event: ChangeEvent<HTMLInputElement>): void {
    onChange({ ...media, url: event.target.value })
  }
  function handleLinkRemove(): void {
    onChange({ ...media, url: '' })
  }

  // Clears the upload slot only (keeps `type`). Shared by Cancel-of-fresh and
  // Remove.
  function clearMuxSlot(): CollectionMediaValues {
    return { ...media, muxVideoId: '', muxPlaybackId: null, muxName: null, muxDuration: null }
  }

  const savedPlaybackId =
    media.muxPlaybackId != null && media.muxPlaybackId !== ''
      ? media.muxPlaybackId
      : null
  // A video the upload slot can actually save: a fresh completed upload (has a
  // muxVideoId) or an existing saved row (has a playbackId). A committed value
  // must survive a replacement attempt untouched.
  const committedVideo = media.muxVideoId !== '' || savedPlaybackId != null

  return (
    <Stack gap={1}>
      <Typography sx={headerSx}>{t('Media')}</Typography>

      {/* Full-width equal-width 3-way toggle. textTransform none so it reads
          "Link" / "Upload" / "None". Selecting only sets `type`. */}
      <ToggleButtonGroup
        exclusive
        fullWidth
        value={media.type}
        onChange={handleTypeChange}
        aria-label={t('Media type')}
        disabled={saving || disableModeSwitch}
        sx={{
          '& .MuiToggleButton-root': { textTransform: 'none', py: 1, mb: 1 }
        }}
      >
        <ToggleButton value={TemplateGalleryPageMediaType.link} aria-label={t('Link')}>
          {t('Link')}
        </ToggleButton>
        <ToggleButton value={TemplateGalleryPageMediaType.mux} aria-label={t('Upload')}>
          {t('Upload')}
        </ToggleButton>
        <ToggleButton value={TemplateGalleryPageMediaType.none} aria-label={t('None')}>
          {t('None')}
        </ToggleButton>
      </ToggleButtonGroup>

      {/* The active tab renders its own slot; the reserved min-height keeps
          switching from shifting the dialog layout. */}
      <Box sx={{ minHeight: MEDIA_BOX_HEIGHT }}>
        {media.type === TemplateGalleryPageMediaType.mux && (
          <MuxUploadField
            uploadKey={uploadKey}
            disabled={saving}
            media={media}
            hasVideo={committedVideo}
            // A replacement upload leaves the committed video untouched (the
            // in-flight provider task is what gates Save). Only a fresh upload
            // writes the incomplete placeholder, which keeps Save blocked until
            // completion.
            onUploadStart={() => {
              // Fresh upload: reset the whole upload slot (incl. any stale
              // name/duration) to the in-flight placeholder.
              if (!committedVideo) onChange(clearMuxSlot())
            }}
            onComplete={(videoId, playbackId, muxName, muxDuration) =>
              onChange({
                ...media,
                muxVideoId: videoId,
                muxPlaybackId: playbackId,
                muxName,
                muxDuration
              })
            }
            // Cancel only clears a fresh upload's placeholder — a replacement
            // never overwrote the committed value.
            onCancel={() => {
              if (!committedVideo) onChange(clearMuxSlot())
            }}
            // Remove clears only the upload slot; `type` stays `mux`.
            onRemove={() => onChange(clearMuxSlot())}
          />
        )}

        {media.type === TemplateGalleryPageMediaType.link && (
          <Stack direction="row" spacing={2} alignItems="flex-start">
            {/* No edit button on Link, so no grey frame — the preview fills the
                whole box. */}
            <Box
              sx={{
                width: MEDIA_BOX_WIDTH,
                height: MEDIA_BOX_HEIGHT,
                flexShrink: 0
              }}
            >
              <MediaPreview media={media} compact fill />
            </Box>
            <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
              <TextField
                value={media.url}
                onChange={handleUrlChange}
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
              <Button
                size="small"
                color="error"
                onClick={handleLinkRemove}
                disabled={saving || media.url.trim() === ''}
                sx={{ alignSelf: 'flex-start' }}
              >
                {t('Remove')}
              </Button>
            </Stack>
          </Stack>
        )}

        {media.type === TemplateGalleryPageMediaType.none && (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ height: MEDIA_BOX_HEIGHT }}
            data-testid="MediaSectionNone"
            // Announce the empty state to assistive tech when the user toggles
            // to None — the aria-pressed toggle alone doesn't read out the
            // "nothing will show" consequence.
            role="status"
          >
            <Typography variant="caption" color="text.secondary">
              {t('No media will be shown on the public page.')}
            </Typography>
          </Stack>
        )}
      </Box>
    </Stack>
  )
}
