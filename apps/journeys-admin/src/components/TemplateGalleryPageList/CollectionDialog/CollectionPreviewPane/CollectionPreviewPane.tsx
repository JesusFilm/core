import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { ReactElement, memo } from 'react'

import type { PublicGalleryPageData } from '@core/journeys/ui/PublicGalleryPage'
import { PublicTemplateGallery } from '@core/journeys/ui/PublicTemplateGallery'
import CopyRightIcon from '@core/shared/ui/icons/CopyRight'
import Play3Icon from '@core/shared/ui/icons/Play3'

import { GetAdminJourneys_journeys as Journey } from '../../../../../__generated__/GetAdminJourneys'
import { copyToClipboard } from '../../../../libs/copyToClipboard'

export interface CollectionPreviewValues {
  title: string
  description: string
  creatorName: string
  creatorImageSrc: string
  creatorImageAlt: string
  mediaUrl: string
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
 * Mobile-shaped preview card mirroring the public gallery page layout.
 * Read-only — no form interactions. Lives on the left of CollectionDialog
 * so the publisher sees how their values will render to viewers.
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

  // Feed the shared public gallery component the same form values the fields
  // below announce. `variant="admin"` forces the mobile layout so the pane
  // mirrors how the page renders on a phone. Empty fields fall back to
  // placeholders so the publisher sees where each value will land.
  const previewData: PublicGalleryPageData = {
    title: values.title !== '' ? values.title : t('Untitled collection'),
    description:
      values.description !== ''
        ? values.description
        : t('A short description of your collection will appear here.'),
    creatorName:
      values.creatorName !== '' ? values.creatorName : t('Creator name'),
    creatorImageSrc:
      values.creatorImageSrc !== '' ? values.creatorImageSrc : null,
    creatorImageAlt: values.creatorImageAlt,
    // NES-1682: the Strategy/media embed was removed from the preview. The
    // `mediaUrl` field still round-trips through the form on save.
    mediaUrl: null,
    items: selectedJourneysOrdered.map((journey) => ({
      id: journey.id,
      title: journey.title,
      description: journey.description,
      slug: journey.slug,
      createdAt: journey.createdAt != null ? String(journey.createdAt) : null,
      languageName: journey.language.name.map(({ value, primary }) => ({
        value,
        primary
      })),
      image:
        journey.primaryImageBlock != null
          ? {
              src: journey.primaryImageBlock.src,
              alt: journey.primaryImageBlock.alt
            }
          : null
    }))
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
        // Mobile-shaped frame hosting the shared public gallery component.
        // aria-hidden keeps screen readers from traversing the duplicate —
        // the URL row above stays announced as the only way to copy/open the
        // public link from inside the edit dialog.
        aria-hidden="true"
        sx={{
          width: 287,
          // Take all the height the URL row above leaves.
          flex: 1,
          minHeight: 0,
          borderRadius: 1,
          overflow: 'hidden',
          boxShadow:
            '0 6px 10px rgba(0,0,0,0.14), 0 1px 18px rgba(0,0,0,0.12), 0 3px 5px rgba(0,0,0,0.2)'
        }}
      >
        {/* Single Y scrollbar; the gallery's card row manages its own X scroll. */}
        <Box sx={{ height: '100%', overflowX: 'hidden', overflowY: 'auto' }}>
          <PublicTemplateGallery variant="admin" data={previewData} />
        </Box>
      </Box>
    </Box>
  )
}

export const CollectionPreviewPane = memo(CollectionPreviewPaneImpl)
