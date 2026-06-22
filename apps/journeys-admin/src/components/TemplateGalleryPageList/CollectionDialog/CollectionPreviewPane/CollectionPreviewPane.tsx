import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { ReactElement, memo, useMemo } from 'react'

import {
  PublicGalleryPage,
  PublicGalleryPageData
} from '@core/journeys/ui/PublicGalleryPage'
import CopyRightIcon from '@core/shared/ui/icons/CopyRight'
import Play3Icon from '@core/shared/ui/icons/Play3'

import { GetAdminJourneys_journeys as Journey } from '../../../../../__generated__/GetAdminJourneys'
import { TemplateGalleryPageMediaType } from '../../../../../__generated__/globalTypes'
import { copyToClipboard } from '../../../../libs/copyToClipboard'
import { MediaPreview } from '../MediaPreview'
import { CollectionMediaValues } from '../useCollectionForm/collectionMedia'

export interface CollectionPreviewValues {
  title: string
  description: string
  creatorName: string
  creatorImageSrc: string
  creatorImageAlt: string
  media: CollectionMediaValues
}

interface CollectionPreviewPaneProps {
  values: CollectionPreviewValues
  selectedJourneysOrdered: readonly Journey[]
  /**
   * Full public URL for the collection. Rendered in a read-only field
   * above the preview card so the publisher can copy / open it. Null
   * when the collection has no slug yet (i.e. unsaved create dialog).
   */
  publicUrl: string | null
  /**
   * Slug of the collection. When provided, "Open in new tab" routes
   * through the authenticated `/api/preview-template-gallery?slug=<slug>`
   * proxy. Null on unsaved create dialog (Open is disabled).
   */
  slug: string | null
  /**
   * False when the active team has a `routeAllTeamJourneys` custom
   * domain — gallery pages can't be hosted on custom domains, so the
   * Open-in-new-tab affordance is disabled with a tooltip.
   * Defaults to true.
   */
  canPublish?: boolean
  /** Tooltip copy for the disabled state when canPublish is false. */
  publishBlockedReason?: string | null
}

/**
 * Map the dialog form values + selected journeys into the neutral
 * `PublicGalleryPageData` shared with the live public page, so the admin
 * preview and the real page render from one source of truth.
 */
function toData(
  values: CollectionPreviewValues,
  journeys: readonly Journey[]
): PublicGalleryPageData {
  return {
    title: values.title,
    description: values.description,
    creatorName: values.creatorName,
    creatorImageSrc: values.creatorImageSrc,
    creatorImageAlt: values.creatorImageAlt,
    // Media is intentionally NOT mapped here: the preview renders *form
    // state* (typing, processing, thumbnails) through the `mediaSlot` below,
    // which the neutral data shape can't express.
    items: journeys.map((journey) => ({
      id: journey.id,
      title: journey.title,
      description: journey.description,
      slug: journey.slug,
      // String-coerce defensively: if Apollo ever returns a custom DateTime
      // scalar or a Date here, parseISO downstream silently yields Invalid
      // Date and the meta line drops the date without warning.
      createdAt: journey.createdAt != null ? String(journey.createdAt) : null,
      languageName: journey.language.name,
      image:
        journey.primaryImageBlock != null
          ? {
              src: journey.primaryImageBlock.src,
              alt: journey.primaryImageBlock.alt
            }
          : null
    }))
  }
}

/**
 * Mobile-shaped preview card mirroring the public gallery page layout.
 * Read-only — no form interactions. Lives on the left of CollectionDialog
 * so the publisher sees how their values will render to viewers. The card
 * body is the shared `PublicGalleryPage` admin variant; the URL row and
 * frame around it are admin-only chrome.
 *
 * Wrapped in React.memo so unrelated re-renders of CollectionDialog
 * (e.g. typing in any non-preview field) don't rebuild the carousel.
 * Receives stable references for all props from the parent.
 */
function CollectionPreviewPaneImpl({
  values,
  selectedJourneysOrdered,
  publicUrl,
  slug,
  canPublish = true,
  publishBlockedReason = null
}: CollectionPreviewPaneProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  // Memoise the mapped view-model so PublicGalleryPage gets a stable
  // reference unless the form values or selected journeys actually change.
  const data = useMemo(
    () => toData(values, selectedJourneysOrdered),
    [values, selectedJourneysOrdered]
  )

  // Open is disabled when (a) the collection isn't saved yet (no slug),
  // (b) the URL is missing, or (c) the team's custom-domain gate blocks
  // gallery publishing entirely.
  const viewDisabled =
    publicUrl == null || slug == null || slug === '' || !canPublish
  const viewTooltip = !canPublish
    ? (publishBlockedReason ?? '')
    : t('Open in new tab')

  async function handleCopy(): Promise<void> {
    if (publicUrl == null) return
    const ok = await copyToClipboard(publicUrl)
    enqueueSnackbar(
      ok ? t('Link copied to clipboard') : t("Couldn't copy link"),
      { variant: ok ? 'success' : 'error', preventDuplicate: true }
    )
  }
  function handleView(): void {
    // `viewDisabled` already gates at runtime, but TypeScript can't
    // narrow `slug` through a boolean — the explicit `slug == null`
    // here is the type-narrowing pair, not a redundant safety check.
    if (viewDisabled || slug == null) return
    window.open(
      `/api/preview-template-gallery?slug=${encodeURIComponent(slug)}`,
      '_blank',
      'noopener,noreferrer'
    )
  }
  return (
    <Box
      sx={{
        bgcolor: '#efefef',
        // 32px x-padding on each side + 287px card + 32px = 351,
        // round to 352 for an even pane width.
        flex: { md: '0 0 352px' },
        px: 4,
        py: 2,
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        alignItems: 'center',
        // Pane never scrolls; the card itself (below) hosts the
        // single Y scrollbar when description + carousel exceed
        // the mobile frame.
        overflow: 'hidden',
        minHeight: 0
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ width: 287, mb: 1.5, flexShrink: 0 }}
      >
        <TextField
          value={publicUrl ?? ''}
          fullWidth
          size="small"
          variant="outlined"
          hiddenLabel
          inputProps={{
            readOnly: true,
            'aria-label': t('Public URL')
          }}
          sx={{ bgcolor: 'white' }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title={t('Copy link')}>
                  <span>
                    <IconButton
                      aria-label={t('Copy link')}
                      onClick={handleCopy}
                      disabled={publicUrl == null}
                      edge="end"
                      size="small"
                    >
                      <CopyRightIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </InputAdornment>
            )
          }}
        />
        <Tooltip
          title={viewTooltip}
          disableHoverListener={!viewDisabled}
          disableFocusListener={!viewDisabled}
        >
          <span>
            <IconButton
              aria-label={t('Open in new tab')}
              onClick={handleView}
              disabled={viewDisabled}
              sx={{
                bgcolor: '#26262E',
                color: 'common.white',
                borderRadius: 1,
                '&:hover': { bgcolor: '#26262E', opacity: 0.85 },
                '&.Mui-disabled': { bgcolor: 'action.disabledBackground' }
              }}
            >
              <Play3Icon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
      <Box
        // The mobile-shaped preview card is a visual mirror of the
        // public gallery page (the shared PublicGalleryPage admin
        // variant) rendered from the same values the form fields below
        // already announce (title, description, creator, template
        // carousel). aria-hidden keeps screen readers from traversing
        // the duplicate. The URL row above stays announced because it's
        // the only way to copy / open the public link from inside the
        // edit dialog.
        aria-hidden="true"
        sx={{
          bgcolor: 'white',
          borderRadius: 1,
          boxShadow:
            '0 6px 10px rgba(0,0,0,0.14), 0 1px 18px rgba(0,0,0,0.12), 0 3px 5px rgba(0,0,0,0.2)',
          width: 287,
          // Take all the height the URL row above leaves. Using
          // height: '100%' here would compute against the gray pane
          // and ignore the URL row, pushing the bottom of the card
          // out of the visible area.
          flex: 1,
          minHeight: 0,
          p: 2.5,
          // Card hosts the single Y scrollbar. Horizontal stays
          // clipped — the template carousel child manages its
          // own X scroll.
          overflowX: 'hidden',
          overflowY: 'auto'
        }}
      >
        <PublicGalleryPage
          variant="admin"
          data={data}
          // The media section previews live form state (a link mid-typing, a
          // processing upload, a mux thumbnail) — states the public renderer
          // can't express — so the admin injects its own MediaPreview.
          mediaSlot={
            values.media.type !== TemplateGalleryPageMediaType.none ? (
              <MediaPreview media={values.media} />
            ) : null
          }
        />
      </Box>
    </Box>
  )
}

export const CollectionPreviewPane = memo(CollectionPreviewPaneImpl)
