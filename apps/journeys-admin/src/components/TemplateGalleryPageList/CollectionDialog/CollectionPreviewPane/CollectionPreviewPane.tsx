import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { ReactElement, memo } from 'react'

import { StrategySection } from '@core/journeys/ui/StrategySection'
import LinkAngledIcon from '@core/shared/ui/icons/LinkAngled'
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
   * The slug of the collection. When provided, the "Open in new tab"
   * button routes through `/api/preview-template-gallery?slug=<slug>`
   * — that proxy revalidates the journeys ISR cache before redirecting,
   * so previewers see the just-saved content. Null on unsaved create
   * dialog (we still render the public URL for display, but Open is
   * disabled).
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

  // Open is disabled when (a) we have no public URL yet, or (b) the
  // team's custom-domain gate blocks gallery publishing entirely.
  const viewDisabled = publicUrl == null || !canPublish
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
    if (viewDisabled) return
    // Proxy through `/api/preview-template-gallery` so the journeys
    // ISR cache is revalidated before redirect (NES-1644). Falls back
    // to the raw public URL if slug is missing (defensive).
    const target =
      slug != null && slug !== ''
        ? `/api/preview-template-gallery?slug=${encodeURIComponent(slug)}`
        : publicUrl
    if (target == null) return
    window.open(target, '_blank', 'noopener,noreferrer')
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
                      <LinkAngledIcon fontSize="small" />
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
        // public gallery page rendered from the same values the form
        // fields below already announce (title, description, creator,
        // template carousel, strategy embed). aria-hidden keeps screen
        // readers from traversing the duplicate. The URL row above
        // stays announced because it's the only way to copy / open the
        // public link from inside the edit dialog.
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
          // (the StrategySection) out of the visible area.
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
        <Stack spacing={1.5}>
          <Typography
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              fontSize: 20,
              lineHeight: 1.2,
              color: '#444451'
            }}
          >
            {values.title !== '' ? values.title : t('Untitled collection')}
          </Typography>
          <Typography
            sx={{
              fontFamily: 'Open Sans, sans-serif',
              fontSize: 14,
              lineHeight: 1.43,
              color: '#444451',
              whiteSpace: 'pre-wrap'
            }}
          >
            {values.description !== ''
              ? values.description
              : t('A short description of your collection will appear here.')}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar
              src={
                values.creatorImageSrc !== ''
                  ? values.creatorImageSrc
                  : undefined
              }
              alt={values.creatorImageAlt}
              sx={{ width: 32, height: 32 }}
            />
            <Typography
              sx={{
                fontFamily: 'Open Sans, sans-serif',
                fontSize: 14,
                color: '#6d6d7d'
              }}
            >
              {values.creatorName !== ''
                ? values.creatorName
                : t('Creator name')}
            </Typography>
          </Stack>
        </Stack>
        <Box
          sx={{
            mt: 2.5,
            // Horizontal scroll for the carousel of selected
            // templates — mirrors the public gallery page layout.
            overflowX: 'auto',
            overflowY: 'hidden',
            mx: -2.5, // bleed past the card padding so cards can
            px: 2.5, // start flush with the card text above
            pb: 2.5 // breathing room below cards so the
            // horizontal scrollbar doesn't sit on the
            // Use/Play buttons
          }}
        >
          <Stack direction="row" spacing={1} sx={{ width: 'fit-content' }}>
            {selectedJourneysOrdered.length === 0
              ? [0, 1].map((idx) => (
                  <Box
                    key={`placeholder-${idx}`}
                    sx={{
                      width: 160,
                      height: 280,
                      borderRadius: 1.5,
                      bgcolor: 'action.hover',
                      flexShrink: 0,
                      opacity: 0.6
                    }}
                  />
                ))
              : selectedJourneysOrdered.map((journey) => (
                  <Stack
                    key={journey.id}
                    spacing={0.75}
                    sx={{ width: 160, flexShrink: 0 }}
                  >
                    <Box
                      sx={{
                        width: '100%',
                        height: 240,
                        borderRadius: 1.5,
                        overflow: 'hidden',
                        position: 'relative',
                        bgcolor: 'action.hover',
                        ...(journey.primaryImageBlock?.src != null && {
                          backgroundImage: `url(${journey.primaryImageBlock.src})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        })
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-end',
                          p: 1,
                          background:
                            'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.16) 50%, rgba(0,0,0,0) 90%)'
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: 'Montserrat, sans-serif',
                            fontWeight: 600,
                            fontSize: 13,
                            lineHeight: 1.25,
                            color: 'white',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}
                        >
                          {journey.title}
                        </Typography>
                      </Box>
                    </Box>
                    {/* Use + Play buttons mirror the public gallery
                        card. They're decorative here — render as Box
                        so they're not keyboard-focusable and assistive
                        tech doesn't announce them as actionable. */}
                    <Stack direction="row" spacing={0.75} aria-hidden="true">
                      <Box
                        sx={{
                          flex: '0 0 auto',
                          width: 96,
                          height: 32,
                          borderRadius: 1,
                          border: '1px solid #444451',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'Montserrat, sans-serif',
                          fontWeight: 700,
                          fontSize: 12,
                          color: '#444451',
                          opacity: 0.6
                        }}
                      >
                        {t('Use')}
                      </Box>
                      <Box
                        sx={{
                          flex: 1,
                          height: 32,
                          borderRadius: 1,
                          bgcolor: '#26262E',
                          color: 'common.white',
                          opacity: 0.6,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Play3Icon sx={{ fontSize: 18 }} />
                      </Box>
                    </Stack>
                  </Stack>
                ))}
          </Stack>
        </Box>
        {/* Embedded PDF/video — same component the editor's About tab
            uses for strategy embeds. Renders an iframe for Canva /
            Google Slides URLs and a "Case Study Preview" placeholder
            otherwise. */}
        <Box sx={{ mt: 2.5 }}>
          <Typography
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              fontSize: 16,
              lineHeight: 1.2,
              color: '#444451',
              mb: 1.5
            }}
          >
            {t('Strategy')}
          </Typography>
          <Box
            sx={{
              // Strip StrategySection's xs/sm bottom padding so it sits
              // flush within the preview card layout.
              '& > .MuiStack-root': { pb: 0 }
            }}
          >
            <StrategySection
              strategySlug={values.mediaUrl !== '' ? values.mediaUrl : null}
              variant="placeholder"
            />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export const CollectionPreviewPane = memo(CollectionPreviewPaneImpl)
