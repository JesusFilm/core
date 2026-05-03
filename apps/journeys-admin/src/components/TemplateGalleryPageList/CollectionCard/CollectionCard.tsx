import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { MouseEvent, ReactElement, ReactNode, useState } from 'react'

import MoreIcon from '@core/shared/ui/icons/More'

import { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../../__generated__/GetTemplateGalleryPages'
import { TemplateGalleryPageStatus } from '../../../../__generated__/globalTypes'

import { CollectionUngroupDialog } from './CollectionUngroupDialog'

export interface CollectionCardProps {
  collection: TemplateGalleryPage
  publicUrlBase?: string
  onEdit?: (collection: TemplateGalleryPage) => void
  onPublish?: (collection: TemplateGalleryPage) => void
  onUnpublish?: (collection: TemplateGalleryPage) => void
  onUngroup?: (collection: TemplateGalleryPage) => void
  busy?: boolean
  /** Rendered inside the card's templates area; the parent owns drag wiring. */
  children?: ReactNode
}

export function CollectionCard({
  collection,
  publicUrlBase,
  onEdit,
  onPublish,
  onUnpublish,
  onUngroup,
  busy,
  children
}: CollectionCardProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [ungroupOpen, setUngroupOpen] = useState(false)

  const isPublished = collection.status === TemplateGalleryPageStatus.published
  const publicUrl =
    isPublished && publicUrlBase != null
      ? `${publicUrlBase}/collections/${collection.slug}`
      : null

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
  function handleUnpublish(): void {
    handleMenuClose()
    onUnpublish?.(collection)
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
      sx={{ p: 2, borderColor: 'divider', borderWidth: 1, borderStyle: 'solid' }}
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
          {collection.templates.length === 0 && (
            <Chip
              size="small"
              variant="outlined"
              label={t('Empty')}
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
          data-no-dnd
        >
          <MoreIcon />
        </IconButton>
        <Menu
          id={`collection-menu-${collection.id}`}
          anchorEl={anchorEl}
          open={anchorEl != null}
          onClose={handleMenuClose}
        >
          <Tooltip
            title={isPublished ? t('Unpublish to edit') : ''}
            placement="left"
            disableHoverListener={!isPublished}
            disableFocusListener={!isPublished}
          >
            <span>
              <MenuItem onClick={handleEdit} disabled={isPublished}>
                {t('Edit')}
              </MenuItem>
            </span>
          </Tooltip>
          {!isPublished && (
            <Tooltip
              title={
                collection.templates.length === 0
                  ? t('Add at least one template before publishing')
                  : ''
              }
              placement="left"
              disableHoverListener={collection.templates.length > 0}
              disableFocusListener={collection.templates.length > 0}
            >
              <span>
                <MenuItem
                  onClick={handlePublish}
                  disabled={collection.templates.length === 0}
                >
                  {t('Publish')}
                </MenuItem>
              </span>
            </Tooltip>
          )}
          {isPublished && (
            <MenuItem onClick={handleUnpublish}>{t('Unpublish')}</MenuItem>
          )}
          <MenuItem onClick={handleOpenUngroup}>{t('Ungroup')}</MenuItem>
        </Menu>
      </Stack>

      {collection.description !== '' && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {collection.description}
        </Typography>
      )}

      {publicUrl != null && (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {t('Public URL')}:
          </Typography>
          <Link
            href={publicUrl}
            target="_blank"
            rel="noreferrer noopener"
            variant="caption"
          >
            {publicUrl}
          </Link>
        </Stack>
      )}

      <CardContent
        sx={{
          p: 0,
          '&:last-child': { pb: 0 },
          minHeight: 100,
          backgroundColor: (theme) => theme.palette.background.default,
          borderRadius: 1
        }}
      >
        {collection.templates.length === 0 ? (
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
        slug={collection.slug}
        publicUrl={publicUrl}
        onClose={handleCloseUngroup}
        onConfirm={handleConfirmUngroup}
      />
    </Card>
  )
}

