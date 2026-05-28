import { useDroppable } from '@dnd-kit/core'
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ChangeEvent, ReactElement, useMemo, useState } from 'react'

import Search1Icon from '@core/shared/ui/icons/Search1'

import { TemplateGalleryPageStatus } from '../../../../../__generated__/globalTypes'
import { LabelChip } from '../../../LabelChip'
import { CollectionActionsMenu } from '../../CollectionActionsMenu'
import { DraggableJourneysGrid, encodeDropZoneId } from '../../Droppables'
import type { CollectionViewProps, TemplateGalleryPage } from '../types'

/**
 * "Finder Sidebar" design-lab variant (NES-1695).
 *
 * Two-column desktop layout that mirrors a Mac Finder window: a sticky
 * left rail lists the available collections with a search filter on top,
 * and the right pane shows the active collection's header strip and
 * `DraggableJourneysGrid`. Each sidebar row doubles as a dnd-kit drop
 * target so templates can be dragged from the grid into a collection in
 * the rail. The "All Templates" row maps to the unsectioned drop zone
 * (drop here to ungroup), and published collections render a grey dashed
 * "blocked drop" affordance + tooltip rather than the usual primary outline.
 *
 * Desktop only — the parent decides whether to render this variant.
 */
export function FinderSidebar({
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
  const [search, setSearch] = useState('')

  // Case-insensitive title match. "All Templates" is always visible and
  // is rendered outside the loop so the search box never hides the
  // top-level filter.
  const visibleCollections = useMemo(() => {
    const needle = search.trim().toLowerCase()
    if (needle === '') return collections
    return collections.filter((collection) =>
      collection.title.toLowerCase().includes(needle)
    )
  }, [collections, search])

  const publishedLock =
    selectedCollection?.status === TemplateGalleryPageStatus.published

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>): void {
    setSearch(event.target.value)
  }

  function handleSelectAll(): void {
    onSelectCollection(null)
  }

  return (
    <Stack
      data-testid="FinderSidebar"
      direction="row"
      spacing={0}
      sx={{
        // The variant owns its full layout — give it a sensible min height
        // so the sticky sidebar has room to scroll within while the right
        // pane drives overall height.
        minHeight: 480,
        alignItems: 'stretch',
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'background.paper'
      }}
    >
      {/* LEFT — sticky vertical sidebar (~240px). Search pinned at the top,
          collection rows scroll within the remaining height. */}
      <Stack
        data-testid="FinderSidebarRail"
        sx={{
          width: 240,
          flexShrink: 0,
          borderRight: 1,
          borderColor: 'divider',
          bgcolor: 'grey.50',
          // Sticky positioning lets the rail stay visible while the right
          // pane scrolls long template grids. `top: 0` is sufficient
          // because the parent page already accounts for the app header.
          position: 'sticky',
          top: 0,
          alignSelf: 'flex-start',
          maxHeight: '100vh'
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            value={search}
            onChange={handleSearchChange}
            placeholder={t('Search collections')}
            size="small"
            fullWidth
            inputProps={{ 'aria-label': t('Search collections') }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search1Icon fontSize="small" />
                </InputAdornment>
              )
            }}
          />
        </Box>
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            py: 1
          }}
        >
          <SidebarRow
            testId="FinderSidebarRow-all"
            title={t('All Templates')}
            count={allTemplatesCount}
            selected={selectedCollectionId === null}
            onSelect={handleSelectAll}
            dropZone={{ kind: 'unsectioned' }}
            dropDisabled={dropDisabled}
            isPublishedDropTarget={false}
          />
          {visibleCollections.map((collection) => (
            <SidebarRow
              key={collection.id}
              testId={`FinderSidebarRow-${collection.id}`}
              title={collection.title}
              count={collection.templates.length}
              selected={selectedCollectionId === collection.id}
              onSelect={() => onSelectCollection(collection.id)}
              dropZone={{ kind: 'collection', id: collection.id }}
              dropDisabled={dropDisabled}
              isPublishedDropTarget={
                collection.status === TemplateGalleryPageStatus.published
              }
              statusLabel={
                collection.status === TemplateGalleryPageStatus.published
                  ? { color: 'success', label: t('Live') }
                  : { color: 'default', label: t('Draft') }
              }
            />
          ))}
        </Box>
      </Stack>

      {/* RIGHT — header strip + filtered grid. */}
      <Stack sx={{ flex: 1, minWidth: 0, p: 3 }} spacing={2}>
        <Stack
          data-testid="FinderSidebarHeader"
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ minHeight: 48, borderBottom: 1, borderColor: 'divider', pb: 1 }}
        >
          <Stack
            direction="row"
            alignItems="baseline"
            spacing={1}
            sx={{ minWidth: 0, flex: 1 }}
          >
            <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
              {selectedCollection?.title ?? t('All Templates')}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ flexShrink: 0 }}
            >
              {t('({{count}} templates)', {
                count: filteredJourneys.length,
                defaultValue_one: '({{count}} template)',
                defaultValue_other: '({{count}} templates)'
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
              testIdSuffix="finder-sidebar"
            />
          )}
        </Stack>

        {filteredJourneys.length === 0 ? (
          <EmptyState
            hasSelectedCollection={selectedCollection != null}
            allTemplatesCount={allTemplatesCount}
          />
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

interface SidebarRowProps {
  testId: string
  title: string
  count: number
  selected: boolean
  onSelect: () => void
  dropZone: { kind: 'unsectioned' } | { kind: 'collection'; id: string }
  dropDisabled: boolean
  isPublishedDropTarget: boolean
  statusLabel?: { color: 'default' | 'success'; label: string }
}

/**
 * Individual rail row. Owns its own `useDroppable` so each collection /
 * the All Templates row can independently respond to drag-over. The
 * dashed "blocked" affordance + tooltip is mirrored from CollectionChip
 * for visual consistency across the variant set.
 */
function SidebarRow({
  testId,
  title,
  count,
  selected,
  onSelect,
  dropZone,
  dropDisabled,
  isPublishedDropTarget,
  statusLabel
}: SidebarRowProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { setNodeRef, isOver } = useDroppable({
    id: encodeDropZoneId(dropZone),
    disabled: dropDisabled
  })

  // Drop blocked = drag is over a published collection (the parent will
  // reject the drop). We still register the droppable so the affordance
  // can render — only the hard locks (busy / dialog) fully disable it.
  const dropBlocked = isOver && isPublishedDropTarget
  const active = selected || (isOver && !isPublishedDropTarget)

  return (
    <Tooltip
      title={t("Templates can't be moved into live collections")}
      open={dropBlocked}
      placement="right"
      arrow
      disableHoverListener
      disableFocusListener
      disableTouchListener
    >
      <ButtonBase
        data-testid={testId}
        ref={setNodeRef}
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={title}
        sx={{
          width: '100%',
          minHeight: 40,
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          textAlign: 'left',
          bgcolor: selected ? 'action.selected' : 'transparent',
          // The row carries two borders: a 1px frame (used for the drop
          // affordance) and a thicker left accent (used for the active
          // selection cue). Both colors transition together so the row
          // can swap between "selected", "valid drop", and "blocked drop"
          // states without layout shift.
          border: 1,
          borderStyle: dropBlocked ? 'dashed' : 'solid',
          borderColor: dropBlocked
            ? 'text.disabled'
            : active && !selected
              ? 'primary.main'
              : 'transparent',
          borderLeftWidth: 3,
          borderLeftColor: dropBlocked
            ? 'text.disabled'
            : selected || (active && !selected)
              ? 'primary.main'
              : 'transparent',
          cursor: dropBlocked ? 'not-allowed' : undefined,
          '&:hover': {
            bgcolor: selected ? 'action.selected' : 'action.hover'
          },
          transition: 'background-color 120ms ease, border-color 120ms ease'
        }}
      >
        <FolderOutlinedIcon
          fontSize="small"
          sx={{ mr: 1.5, color: 'text.secondary', flexShrink: 0 }}
        />
        <Typography
          variant="body2"
          sx={{
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontWeight: selected ? 600 : 400
          }}
        >
          {title}
        </Typography>
        {statusLabel != null && (
          <LabelChip
            color={statusLabel.color}
            label={statusLabel.label}
            sx={{
              // Compact label sized for the 40px row.
              height: 18,
              fontSize: 10,
              lineHeight: '14px',
              px: 1,
              mx: 1,
              flexShrink: 0
            }}
          />
        )}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ flexShrink: 0, ml: 'auto', pl: 1 }}
        >
          {count}
        </Typography>
      </ButtonBase>
    </Tooltip>
  )
}

interface EmptyStateProps {
  hasSelectedCollection: boolean
  allTemplatesCount: number
}

function EmptyState({
  hasSelectedCollection,
  allTemplatesCount
}: EmptyStateProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  // Pick the most accurate message for the empty pane: collection-specific
  // when a collection is selected, otherwise differentiate "team has no
  // templates" from "everything is already grouped".
  let message: string
  if (hasSelectedCollection) {
    message = t('No templates yet — drag templates here to add them.')
  } else if (allTemplatesCount === 0) {
    message = t('No team templates yet.')
  } else {
    message = t('All templates are in collections.')
  }

  return (
    <Box
      data-testid="FinderSidebarEmpty"
      sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 4,
        textAlign: 'center'
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  )
}
