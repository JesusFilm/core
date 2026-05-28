import { useDroppable } from '@dnd-kit/core'
import AllInboxIcon from '@mui/icons-material/AllInbox'
import FolderIcon from '@mui/icons-material/Folder'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { TemplateGalleryPageStatus } from '../../../../../__generated__/globalTypes'
import { LabelChip } from '../../../LabelChip'
import { CollectionActionsMenu } from '../../CollectionActionsMenu'
import { DraggableJourneysGrid, encodeDropZoneId } from '../../Droppables'
import type { CollectionViewProps, TemplateGalleryPage } from '../types'

/**
 * "Folder Grid" design-lab variant (NES-1695).
 *
 * Dropbox/Drive-style desktop layout: a top section presents collections as
 * a responsive grid of square folder cards (~5 per row on lg) with a folder
 * icon, title, and template count. The first card is a special "All
 * Templates" tile that maps to the unsectioned drop zone. Beneath the
 * folder grid a templates section shows the active collection's name,
 * count, and 3-dot actions menu, then renders the standard
 * `DraggableJourneysGrid` for the filtered templates.
 *
 * Each folder card doubles as a dnd-kit drop target so templates can be
 * dragged from the grid into a collection. Published collections render a
 * grey dashed "blocked drop" affordance + tooltip (mirroring CollectionChip)
 * rather than the usual primary outline. Desktop only — the parent decides
 * whether to render this variant.
 */
export function FolderGrid({
  collections,
  allTemplatesCount,
  selectedCollectionId,
  onSelectCollection,
  dropDisabled,
  filteredJourneys,
  selectedCollection,
  dragInFlight,
  onEdit,
  onOpenPublish,
  onUngroup,
  busyId,
  canPublish,
  publishBlockedReason
}: CollectionViewProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const publishedLock =
    selectedCollection?.status === TemplateGalleryPageStatus.published

  function handleSelectAll(): void {
    onSelectCollection(null)
  }

  function handleSelectCollection(id: string): void {
    onSelectCollection(id)
  }

  return (
    <Stack data-testid="FolderGrid" spacing={3} sx={{ minWidth: 0 }}>
      {/* TOP — Folders section. */}
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {t('Folders')}
        </Typography>
        {collections.length === 0 ? (
          <Typography
            data-testid="FolderGridEmptyCollections"
            variant="body2"
            color="text.secondary"
          >
            {t('No collections yet.')}
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {/* All Templates always leads the grid. */}
            <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2.4 }}>
              <AllTemplatesFolderCard
                count={allTemplatesCount}
                selected={selectedCollectionId === null}
                onSelect={handleSelectAll}
                dropDisabled={dropDisabled}
              />
            </Grid>
            {collections.map((collection) => (
              <Grid key={collection.id} size={{ xs: 6, sm: 4, md: 3, lg: 2.4 }}>
                <CollectionFolderCard
                  collection={collection}
                  selected={selectedCollectionId === collection.id}
                  onSelect={handleSelectCollection}
                  dropDisabled={dropDisabled}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>

      <Divider />

      {/* BELOW — Templates section. */}
      <Stack spacing={2}>
        <Stack
          data-testid="FolderGridTemplatesHeader"
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ minHeight: 48 }}
        >
          <Stack
            direction="row"
            alignItems="baseline"
            spacing={1}
            sx={{ minWidth: 0, flex: 1 }}
          >
            <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>
              {selectedCollection?.title ?? t('All Templates')}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ flexShrink: 0 }}
            >
              ·{' '}
              {t('{{count}} templates', {
                count: filteredJourneys.length,
                defaultValue_one: '{{count}} template',
                defaultValue_other: '{{count}} templates'
              })}
            </Typography>
          </Stack>
          {/* All Templates is not a managed entity — no per-collection menu. */}
          {selectedCollection != null && (
            <CollectionActionsMenu
              collection={selectedCollection}
              onEdit={onEdit}
              onPublish={onOpenPublish}
              onUngroup={onUngroup}
              busy={busyId === selectedCollection.id}
              canPublish={canPublish}
              publishBlockedReason={publishBlockedReason}
              testIdSuffix="folder-grid"
            />
          )}
        </Stack>

        {filteredJourneys.length === 0 ? (
          <Box
            data-testid="FolderGridEmptyTemplates"
            sx={{
              py: 8,
              px: 4,
              textAlign: 'center'
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {t('No templates yet — drag templates here to add them.')}
            </Typography>
          </Box>
        ) : (
          <DraggableJourneysGrid
            journeys={filteredJourneys}
            publishedLock={publishedLock}
            dragInFlight={dragInFlight}
          />
        )}
      </Stack>
    </Stack>
  )
}

interface AllTemplatesFolderCardProps {
  count: number
  selected: boolean
  onSelect: () => void
  dropDisabled: boolean
}

/**
 * "All Templates" folder card. Visually distinct from the collection cards
 * (different icon + primary-tinted background) and maps to the unsectioned
 * drop zone so dropping a template here ungroups it.
 */
function AllTemplatesFolderCard({
  count,
  selected,
  onSelect,
  dropDisabled
}: AllTemplatesFolderCardProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { setNodeRef, isOver } = useDroppable({
    id: encodeDropZoneId({ kind: 'unsectioned' }),
    disabled: dropDisabled
  })
  const active = selected || isOver

  return (
    <ButtonBase
      data-testid="FolderGridAllTemplatesCard"
      ref={setNodeRef}
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={t('All Templates')}
      sx={{
        width: 140,
        height: 140,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        borderRadius: 2,
        border: 1,
        borderColor: active ? 'primary.main' : 'divider',
        // Tinted background sets the All Templates tile apart from the
        // neutral collection cards in the grid.
        bgcolor: 'action.selected',
        transition:
          'border-color 120ms ease, box-shadow 120ms ease, background-color 120ms ease',
        '&:hover': {
          boxShadow: 1
        }
      }}
    >
      <AllInboxIcon
        sx={{
          fontSize: 32,
          color: 'primary.main',
          mb: 1
        }}
      />
      <Typography
        variant="subtitle2"
        noWrap
        sx={{ width: '100%', fontWeight: 600 }}
      >
        {t('All Templates')}
      </Typography>
      <Typography variant="caption" color="text.secondary" noWrap>
        {t('{{count}} templates', {
          count,
          defaultValue_one: '{{count}} template',
          defaultValue_other: '{{count}} templates'
        })}
      </Typography>
    </ButtonBase>
  )
}

interface CollectionFolderCardProps {
  collection: TemplateGalleryPage
  selected: boolean
  onSelect: (id: string) => void
  dropDisabled: boolean
}

/**
 * Folder card for a single collection. Renders the collection title, a
 * folder icon, a template count, and a "Live" label for published
 * collections (top-right). Doubles as a dnd-kit drop target — published
 * collections show a grey dashed border + tooltip when hovered with a drag
 * (mirroring CollectionChip), other collections show a primary outline.
 */
function CollectionFolderCard({
  collection,
  selected,
  onSelect,
  dropDisabled
}: CollectionFolderCardProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const isPublished = collection.status === TemplateGalleryPageStatus.published
  const count = collection.templates.length

  const { setNodeRef, isOver } = useDroppable({
    id: encodeDropZoneId({ kind: 'collection', id: collection.id }),
    // Published collections stay a registered drop target so the
    // "blocked" tooltip + dashed border can render on drag-over; the
    // parent rejects the drop. Only the hard locks fully disable it.
    disabled: dropDisabled
  })
  const dropBlocked = isOver && isPublished
  const active = selected || (isOver && !isPublished)

  function handleClick(): void {
    onSelect(collection.id)
  }

  return (
    <Tooltip
      title={t("Templates can't be moved into live collections")}
      open={dropBlocked}
      placement="top"
      arrow
      disableHoverListener
      disableFocusListener
      disableTouchListener
    >
      <ButtonBase
        data-testid={`FolderGridCard-${collection.id}`}
        ref={setNodeRef}
        onClick={handleClick}
        aria-pressed={selected}
        aria-label={collection.title}
        sx={{
          position: 'relative',
          width: 140,
          height: 140,
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          borderRadius: 2,
          border: 1,
          borderStyle: dropBlocked ? 'dashed' : 'solid',
          borderColor: dropBlocked
            ? 'text.disabled'
            : active
              ? 'primary.main'
              : 'divider',
          bgcolor: 'background.paper',
          cursor: dropBlocked ? 'not-allowed' : undefined,
          transition: 'border-color 120ms ease, box-shadow 120ms ease',
          '&:hover': {
            boxShadow: 1
          }
        }}
      >
        {isPublished && (
          <LabelChip
            data-testid={`FolderGridCard-${collection.id}-status`}
            color="success"
            label={t('Live')}
            sx={{
              position: 'absolute',
              top: 6,
              right: 6,
              // Compact label sized to sit in the corner of the 140px card.
              height: 18,
              fontSize: 10,
              lineHeight: '14px',
              px: 1
            }}
          />
        )}
        <FolderIcon
          sx={{
            fontSize: 32,
            color: 'text.secondary',
            mb: 1
          }}
        />
        <Typography
          variant="subtitle2"
          noWrap
          sx={{ width: '100%', fontWeight: 600 }}
        >
          {collection.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {t('{{count}} templates', {
            count,
            defaultValue_one: '{{count}} template',
            defaultValue_other: '{{count}} templates'
          })}
        </Typography>
      </ButtonBase>
    </Tooltip>
  )
}
