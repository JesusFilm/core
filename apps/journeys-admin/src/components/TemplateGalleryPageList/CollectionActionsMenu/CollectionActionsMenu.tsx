import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import { useTranslation } from 'next-i18next/pages'
import { MouseEvent, ReactElement, useState } from 'react'

import MoreIcon from '@core/shared/ui/icons/More'

import { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../../__generated__/GetTemplateGalleryPages'
import { TemplateGalleryPageStatus } from '../../../../__generated__/globalTypes'
import { CollectionUngroupDialog } from '../CollectionCard/CollectionUngroupDialog'

export interface CollectionActionsMenuProps {
  collection: TemplateGalleryPage
  onEdit?: (collection: TemplateGalleryPage) => void
  onPublish?: (collection: TemplateGalleryPage) => void
  onUngroup?: (collection: TemplateGalleryPage) => void
  busy?: boolean
  canPublish?: boolean
  publishBlockedReason?: string | null
  /** Test id suffix so multiple instances on a page are distinguishable. */
  testIdSuffix?: string
}

/**
 * 3-dot actions menu for a single collection, used by the mobile filter header
 * strip. Mirrors the desktop CollectionCard's inline menu (9247): a state-aware
 * Edit (published) or Publish (draft) entry, Preview, and Remove. Unpublish is
 * intentionally absent — it lives in the edit dialog's footer so the menu keeps
 * a single dialog entry point.
 */
export function CollectionActionsMenu({
  collection,
  onEdit,
  onPublish,
  onUngroup,
  busy,
  canPublish = true,
  publishBlockedReason = null,
  testIdSuffix
}: CollectionActionsMenuProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [ungroupOpen, setUngroupOpen] = useState(false)

  const isPublished = collection.status === TemplateGalleryPageStatus.published
  const menuId = `collection-menu-${collection.id}${testIdSuffix != null ? `-${testIdSuffix}` : ''}`

  const previewDisabled = !isPublished || !canPublish || !collection.slug
  const previewHref = `/api/preview-template-gallery?slug=${encodeURIComponent(collection.slug)}`
  const previewTooltip = !canPublish
    ? (publishBlockedReason ?? '')
    : !isPublished
      ? t('Publish the collection to preview it.')
      : ''

  // Empty collections may still open the publish dialog — the dialog's own
  // Publish button gates emptiness. Only the harder custom-domain constraint
  // disables the menu item (mirrors the desktop CollectionCard).
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
    <>
      <IconButton
        data-testid={`CollectionActionsMenuButton${testIdSuffix != null ? `-${testIdSuffix}` : ''}`}
        aria-label={t('Collection actions')}
        aria-controls={anchorEl != null ? menuId : undefined}
        aria-haspopup="true"
        aria-expanded={anchorEl != null ? 'true' : undefined}
        onClick={handleMenuOpen}
        disabled={busy === true}
      >
        <MoreIcon />
      </IconButton>
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={anchorEl != null}
        onClose={handleMenuClose}
      >
        {/* State-aware single dialog entry point: published collections expose
            "Edit"; drafts expose "Publish" (the dialog has a Save Draft button
            for draft edits). Matches the desktop CollectionCard. */}
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
      <CollectionUngroupDialog
        open={ungroupOpen}
        wasPublished={collection.publishedAt != null}
        onClose={handleCloseUngroup}
        onConfirm={handleConfirmUngroup}
      />
    </>
  )
}
