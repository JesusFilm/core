import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import {
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  ReactNode,
  memo,
  useState
} from 'react'

import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'
import MoreIcon from '@core/shared/ui/icons/More'

import { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../../__generated__/GetTemplateGalleryPages'
import { TemplateGalleryPageStatus } from '../../../../__generated__/globalTypes'
import { LabelChip } from '../../LabelChip'
import {
  COLLECTION_CARD_BORDER_WIDTH,
  COLLECTION_CARD_PADDING
} from '../collectionLayout'

import { CollectionUngroupDialog } from './CollectionUngroupDialog'

export interface CollectionCardProps {
  collection: TemplateGalleryPage
  onEdit?: (collection: TemplateGalleryPage) => void
  onUngroup?: (collection: TemplateGalleryPage) => void
  busy?: boolean
  /**
   * False when the active team has a `routeAllTeamJourneys` custom
   * domain — gallery pages can't be hosted on custom domains, so
   * Preview is disabled with a tooltip.
   * Defaults to true to keep behaviour unchanged for non-custom-domain
   * teams.
   */
  canPublish?: boolean
  /**
   * Tooltip copy shown on the disabled Preview menu item when
   * `canPublish` is false.
   */
  publishBlockedReason?: string | null
  /**
   * NES-1717: when true the card's body (description + templates grid) is
   * hidden, leaving only the header. The header stays inside the parent's
   * droppable wrapper so it remains a valid drop target while collapsed.
   * Defaults to false (expanded).
   */
  collapsed?: boolean
  /**
   * Fired when the user toggles the header. The parent owns and persists the
   * collapsed state; when omitted the header still renders but toggling is a
   * no-op.
   */
  onToggleCollapse?: (collection: TemplateGalleryPage) => void
  /** Rendered inside the card's templates area; the parent owns drag wiring. */
  children?: ReactNode
}

function CollectionCardImpl({
  collection,
  onEdit,
  onUngroup,
  busy,
  canPublish = true,
  publishBlockedReason = null,
  collapsed = false,
  onToggleCollapse,
  children
}: CollectionCardProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [ungroupOpen, setUngroupOpen] = useState(false)

  const isPublished = collection.status === TemplateGalleryPageStatus.published
  const isEmpty = collection.templates.length === 0
  const contentId = `collection-content-${collection.id}`

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
  function handleToggleCollapse(): void {
    // Refuse toggles while busy — `busy` is true while a drop's mutation is in
    // flight (parent passes `dragInFlight`), and collapsing then would unmount
    // this collection's SortableContext under dnd-kit's settling drop,
    // corrupting its measured rects (NES-1717 review).
    if (busy === true) return
    onToggleCollapse?.(collection)
  }
  function handleToggleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    // Enter / Space activate a button per WAI-ARIA; the header is a div with
    // role="button" so we wire them by hand.
    if (event.key !== 'Enter' && event.key !== ' ') return
    // While busy the toggle is inert — bail before preventDefault so a Space
    // press still does its native thing (page scroll) instead of being
    // swallowed to no effect.
    if (busy === true) return
    // preventDefault stops Space from scrolling the page when we do toggle.
    event.preventDefault()
    onToggleCollapse?.(collection)
  }

  return (
    <Card
      data-testid={`CollectionCard-${collection.id}`}
      sx={{
        // Inner padding (12px). The collections Stack bleeds each box outward
        // by this padding + border so the inner card grid lines up with the
        // All Templates grid — both derive from collectionLayout constants.
        p: COLLECTION_CARD_PADDING,
        // NES-1696: a subtle transparent-white panel over the grey page
        // with a light grey stroke and no shadow, per the Figma design.
        // Spec: bg rgba(255,255,255,0.40), 1px solid divider (#DEDFE0),
        // 12px radius (borderRadius 3 × the 4px theme.shape.borderRadius).
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        borderColor: 'divider',
        borderWidth: COLLECTION_CARD_BORDER_WIDTH,
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
        sx={{ mb: collapsed ? 0 : 1 }}
      >
        {/* The whole header (chevron + title + chips) is the toggle, so it's
            an easy touch target. It's a div with role="button" — not a real
            <button> — because the actions IconButton (and its Menu) is a
            sibling, and nesting a button inside a button is invalid HTML. */}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          role="button"
          tabIndex={0}
          aria-expanded={!collapsed}
          // Only reference the content region while it's mounted. `Collapse
          // unmountOnExit` removes it from the DOM when collapsed, so a static
          // aria-controls would dangle for screen readers (mirrors the
          // TemplateInfoHelper pattern). aria-expanded still conveys state.
          aria-controls={collapsed ? undefined : contentId}
          aria-disabled={busy === true}
          // State-aware label: screen readers announce the action before
          // aria-expanded, so "Expand/Collapse" reads better than "Toggle".
          aria-label={
            collapsed
              ? t('Expand {{title}} collection', { title: collection.title })
              : t('Collapse {{title}} collection', { title: collection.title })
          }
          onClick={handleToggleCollapse}
          onKeyDown={handleToggleKeyDown}
          data-testid={`CollectionCardToggle-${collection.id}`}
          sx={{
            flex: 1,
            minWidth: 0,
            cursor: busy === true ? 'default' : 'pointer',
            userSelect: 'none',
            borderRadius: 1
          }}
        >
          <ChevronDownIcon
            sx={{
              flexShrink: 0,
              color: 'text.secondary',
              transition: 'transform 0.2s ease',
              transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)'
            }}
          />
          <Typography variant="h6" noWrap sx={{ minWidth: 0 }}>
            {collection.title}
          </Typography>
          <LabelChip
            color={isPublished ? 'success' : 'default'}
            label={isPublished ? t('Live') : t('Draft')}
          />
          {isEmpty && <LabelChip label={t('Empty')} />}
          {collapsed && !isEmpty && (
            <LabelChip
              label={String(collection.templates.length)}
              data-testid={`CollectionCardCount-${collection.id}`}
            />
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
          {/* Single entry point into CollectionDialog, regardless of
              status — the dialog's footer is what's contextual (a
              draft shows Publish, a published collection shows
              Unpublish, Save is always present). */}
          <MenuItem onClick={handleEdit}>{t('Edit')}</MenuItem>
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

      {/* unmountOnExit so a settled-collapsed card has no mounted templates
          grid — the grid's sortable items would otherwise stay registered as
          drop targets and skew dnd-kit's collision detection. While collapsed
          the header alone fills the parent's droppable, so dropping onto it
          still lands the template in this collection (NES-1717). */}
      <Collapse in={!collapsed} unmountOnExit id={contentId}>
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
          {/* NES-1703: children render unconditionally — the grid's
              always-present DropPlaceholderTile is the empty-state drop
              affordance now. */}
          {children}
        </CardContent>
      </Collapse>

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
