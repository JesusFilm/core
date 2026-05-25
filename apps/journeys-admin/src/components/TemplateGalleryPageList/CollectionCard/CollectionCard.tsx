import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { MouseEvent, ReactElement, ReactNode, memo, useState } from 'react'

import MoreIcon from '@core/shared/ui/icons/More'

import { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../../__generated__/GetTemplateGalleryPages'
import { TemplateGalleryPageStatus } from '../../../../__generated__/globalTypes'

import { CollectionUngroupDialog } from './CollectionUngroupDialog'

export interface CollectionCardProps {
  collection: TemplateGalleryPage
  onEdit?: (collection: TemplateGalleryPage) => void
  onPublish?: (collection: TemplateGalleryPage) => void
  onUngroup?: (collection: TemplateGalleryPage) => void
  busy?: boolean
  /**
   * False when the active team has a `routeAllTeamJourneys` custom
   * domain — gallery pages can't be hosted on custom domains, so
   * Publish + Preview are disabled with a tooltip.
   * Defaults to true to keep behaviour unchanged for non-custom-domain
   * teams.
   */
  canPublish?: boolean
  /**
   * Tooltip copy shown on the disabled Publish / Preview menu items
   * when `canPublish` is false. Null falls back to the default
   * disabled-because-empty copy on Publish (Preview only renders this
   * tooltip when canPublish is false).
   */
  publishBlockedReason?: string | null
  /** Rendered inside the card's templates area; the parent owns drag wiring. */
  children?: ReactNode
}

function CollectionCardImpl({
  collection,
  onEdit,
  onPublish,
  onUngroup,
  busy,
  canPublish = true,
  publishBlockedReason = null,
  children
}: CollectionCardProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [ungroupOpen, setUngroupOpen] = useState(false)

  const isPublished = collection.status === TemplateGalleryPageStatus.published
  const isEmpty = collection.templates.length === 0

  // Preview (a) only makes sense once the page is publicly reachable, (b) is
  // also gated by custom-domain teams — same constraint as Publish, and (c)
  // needs a slug to build a valid proxy URL. The server's SLUG_RE rejects
  // empty slugs with 400; this keeps the menu item disabled so a click can't
  // open a tab onto the error page.
  const previewDisabled = !isPublished || !canPublish || !collection.slug
  const previewHref = `/api/preview-template-gallery?slug=${encodeURIComponent(collection.slug)}`
  const previewTooltip = !canPublish
    ? (publishBlockedReason ?? '')
    : !isPublished
      ? t('Publish the collection to preview it.')
      : ''

  // The Publish menu item is the user's single entry point into the
  // dialog for a draft, so we only disable it for the harder
  // constraint — custom-domain teams that can't publish at all.
  // Empty collections still open the dialog (the user may want to
  // fill in metadata before adding templates); the dialog's own
  // Publish button is what gates emptiness.
  const publishDisabled = !canPublish
  const publishTooltip = !canPublish ? (publishBlockedReason ?? '') : ''

  function handleMenuOpen(event: MouseEvent<HTMLButtonElement>): void {
    setAnchorEl(event.currentTarget)
  }
  function handleMenuClose(): void {
    setAnchorEl(null)
  }
  function handleEdit(): void {
    handleMenuClose()
    onEdit?.(collection)
  }
  function handlePublish(): void {
    handleMenuClose()
    onPublish?.(collection)
  }
  function handlePreview(): void {
    handleMenuClose()
    if (previewDisabled) return
    window.open(previewHref, '_blank', 'noopener,noreferrer')
  }
  function handleOpenUngroup(): void {
    handleMenuClose()
    setUngroupOpen(true)
  }
  function handleCloseUngroup(): void {
    setUngroupOpen(false)
  }
  function handleConfirmUngroup(): void {
    setUngroupOpen(false)
    onUngroup?.(collection)
  }

  return (
    <Card
      data-testid={`CollectionCard-${collection.id}`}
      sx={{
        p: 2,
        // NES-1696: a subtle transparent-white panel over the grey page
        // with a light grey stroke and no shadow, per the Figma design.
        // Spec: bg rgba(255,255,255,0.40), 1px solid divider (#DEDFE0),
        // 12px radius (borderRadius 3 × the 4px theme.shape.borderRadius).
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        borderColor: 'divider',
        borderWidth: 1,
        borderStyle: 'solid',
        borderRadius: 3,
        boxShadow: 'none'
      }}
      variant="outlined"
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 1 }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="h6">{collection.title}</Typography>
          <Chip
            size="small"
            color={isPublished ? 'success' : 'default'}
            label={isPublished ? t('Published') : t('Draft')}
          />
          {isEmpty && (
            <Chip size="small" variant="outlined" label={t('Empty')} />
          )}
        </Stack>
        <IconButton
          aria-label={t('Collection actions')}
          aria-controls={
            anchorEl != null ? `collection-menu-${collection.id}` : undefined
          }
          aria-haspopup="true"
          aria-expanded={anchorEl != null ? 'true' : undefined}
          onClick={handleMenuOpen}
          disabled={busy === true}
        >
          <MoreIcon />
        </IconButton>
        <Menu
          id={`collection-menu-${collection.id}`}
          anchorEl={anchorEl}
          open={anchorEl != null}
          onClose={handleMenuClose}
        >
          {/* Single state-aware entry point into CollectionDialog.
              Draft collections expose "Publish" so the user has a
              discoverable path to publishing; the dialog itself
              renders a Save Draft secondary button so draft edits
              don't require a publish. Published collections expose
              "Edit" — Publish is no longer applicable. */}
          {isPublished ? (
            <MenuItem onClick={handleEdit}>{t('Edit')}</MenuItem>
          ) : (
            <Tooltip
              title={publishTooltip}
              placement="left"
              disableHoverListener={!publishDisabled}
              disableFocusListener={!publishDisabled}
            >
              <span>
                <MenuItem onClick={handlePublish} disabled={publishDisabled}>
                  {t('Publish')}
                </MenuItem>
              </span>
            </Tooltip>
          )}
          <Tooltip
            title={previewTooltip}
            placement="left"
            disableHoverListener={!previewDisabled}
            disableFocusListener={!previewDisabled}
          >
            <span>
              <MenuItem onClick={handlePreview} disabled={previewDisabled}>
                {t('Preview')}
              </MenuItem>
            </span>
          </Tooltip>
          <MenuItem onClick={handleOpenUngroup}>
            {t('Remove Collection')}
          </MenuItem>
        </Menu>
      </Stack>

      {collection.description != null && collection.description !== '' && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {collection.description}
        </Typography>
      )}

      <CardContent
        sx={{
          p: 0,
          '&:last-child': { pb: 0 },
          minHeight: 100
        }}
      >
        {isEmpty ? (
          <Box
            sx={{
              p: 2,
              textAlign: 'center',
              color: 'text.disabled'
            }}
          >
            <Typography variant="caption">
              {t('Drag templates here to add them to this collection.')}
            </Typography>
          </Box>
        ) : (
          children
        )}
      </CardContent>

      <CollectionUngroupDialog
        open={ungroupOpen}
        wasPublished={collection.publishedAt != null}
        onClose={handleCloseUngroup}
        onConfirm={handleConfirmUngroup}
      />
    </Card>
  )
}

export const CollectionCard = memo(CollectionCardImpl)
