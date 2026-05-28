import { useDroppable } from '@dnd-kit/core'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useMemo, useState } from 'react'

import Search1Icon from '@core/shared/ui/icons/Search1'

import { TemplateGalleryPageStatus } from '../../../../../__generated__/globalTypes'
import { DraggableJourneysGrid, encodeDropZoneId } from '../../Droppables'
import { MobileFilterHeaderStrip } from '../../MobileFilterHeaderStrip'
import type { CollectionViewProps, TemplateGalleryPage } from '../types'

const ALL_TEMPLATES_KEY = '__all_templates__'

interface PillProps {
  /** Stable identifier used for `data-testid` + droppable id. */
  pillKey: string
  title: string
  count: number
  selected: boolean
  isPublished: boolean
  /** The droppable id this pill registers with dnd-kit. */
  dropZoneId: string
  /** When true the pill won't accept drops (busy / open dialog). */
  dropDisabled: boolean
  onClick: () => void
}

/**
 * A single filter pill. Doubles as a dnd-kit drop target — published
 * collections show the same dashed border + tooltip as the desktop
 * `CollectionChip` when something is dragged over them, even though the drop
 * itself is rejected upstream.
 */
function Pill({
  pillKey,
  title,
  count,
  selected,
  isPublished,
  dropZoneId,
  dropDisabled,
  onClick
}: PillProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { setNodeRef, isOver } = useDroppable({
    id: dropZoneId,
    disabled: dropDisabled
  })
  const dropBlocked = isOver && isPublished
  const active = selected || (isOver && !isPublished)

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
        ref={setNodeRef}
        data-testid={`CompactPill-${pillKey}`}
        onClick={onClick}
        aria-pressed={selected}
        aria-label={title}
        sx={{
          height: 32,
          px: 1.5,
          borderRadius: 999,
          border: 1,
          borderStyle: dropBlocked ? 'dashed' : 'solid',
          borderColor: dropBlocked
            ? 'text.disabled'
            : active
              ? 'primary.main'
              : 'divider',
          bgcolor: selected ? 'primary.main' : 'background.paper',
          color: selected ? 'primary.contrastText' : 'text.primary',
          outline: isOver && !isPublished ? '2px solid' : 'none',
          outlineColor: 'primary.dark',
          outlineOffset: 2,
          cursor: dropBlocked ? 'not-allowed' : undefined,
          transition:
            'background-color 120ms ease, border-color 120ms ease, color 120ms ease',
          '&:hover': {
            bgcolor: selected ? 'primary.dark' : 'action.hover'
          }
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.75}
          sx={{ minWidth: 0 }}
        >
          {isPublished && (
            <Box
              data-testid={`CompactPillLiveDot-${pillKey}`}
              aria-hidden
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'success.main',
                flexShrink: 0
              }}
            />
          )}
          <Typography
            variant="subtitle2"
            noWrap
            sx={{ fontWeight: 600, color: 'inherit' }}
          >
            {title}
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{
              color: selected ? 'primary.contrastText' : 'text.secondary',
              opacity: selected ? 0.85 : 1,
              flexShrink: 0
            }}
          >
            {count}
          </Typography>
        </Stack>
      </ButtonBase>
    </Tooltip>
  )
}

/**
 * Compact Pills variant (NES-1695 design lab). Renders a search input over a
 * wrapping row of small pill-shaped filter chips — "All Templates" pinned
 * first, followed by every collection — then a header strip and the standard
 * `DraggableJourneysGrid` below. Pills are dnd-kit drop targets, mirroring
 * the desktop `CollectionChip` published-collection blocked-drop affordance.
 *
 * Local search state filters which pills are visible by case-insensitive
 * title match; pill count badges always reflect the underlying collection
 * counts, never the search-filtered subset.
 */
export function CompactPills({
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
  const [searchTerm, setSearchTerm] = useState('')

  const trimmedSearch = searchTerm.trim().toLowerCase()
  const visibleCollections = useMemo(() => {
    if (trimmedSearch === '') return collections
    return collections.filter((collection) =>
      collection.title.toLowerCase().includes(trimmedSearch)
    )
  }, [collections, trimmedSearch])

  function handleSelectAll(): void {
    onSelectCollection(null)
  }

  function handleSelectCollection(collection: TemplateGalleryPage): void {
    onSelectCollection(collection.id)
  }

  const publishedLock =
    selectedCollection?.status === TemplateGalleryPageStatus.published
  const busy =
    (selectedCollection != null && busyId === selectedCollection.id) ||
    dragInFlight
  const showEmptyState = filteredJourneys.length === 0
  const emptyMessage =
    selectedCollection == null
      ? t('All templates are in collections.')
      : t('No templates yet — drag templates here to add them.')

  return (
    <Stack
      data-testid="CompactPills"
      spacing={2}
      sx={{ width: '100%', minWidth: 0 }}
    >
      <TextField
        size="small"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        label={t('Search collections')}
        placeholder={t('Search collections…')}
        inputProps={{ 'aria-label': t('Search collections') }}
        sx={{ width: 280 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search1Icon fontSize="small" />
            </InputAdornment>
          )
        }}
      />

      <Stack
        data-testid="CompactPillsRow"
        direction="row"
        spacing={1}
        useFlexGap
        sx={{ flexWrap: 'wrap', rowGap: 1 }}
      >
        <Pill
          pillKey={ALL_TEMPLATES_KEY}
          title={t('All Templates')}
          count={allTemplatesCount}
          selected={selectedCollectionId == null}
          isPublished={false}
          dropZoneId={encodeDropZoneId({ kind: 'unsectioned' })}
          dropDisabled={dropDisabled}
          onClick={handleSelectAll}
        />
        {visibleCollections.map((collection) => (
          <Pill
            key={collection.id}
            pillKey={collection.id}
            title={collection.title}
            count={collection.templates.length}
            selected={selectedCollectionId === collection.id}
            isPublished={
              collection.status === TemplateGalleryPageStatus.published
            }
            dropZoneId={encodeDropZoneId({
              kind: 'collection',
              id: collection.id
            })}
            dropDisabled={dropDisabled}
            onClick={() => handleSelectCollection(collection)}
          />
        ))}
      </Stack>

      <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
        <MobileFilterHeaderStrip
          selectedCollection={selectedCollection}
          count={filteredJourneys.length}
          onEdit={onEdit}
          onPublish={onOpenPublish}
          onUngroup={onUngroup}
          busy={busy}
          canPublish={canPublish}
          publishBlockedReason={publishBlockedReason}
        />
      </Box>

      {showEmptyState ? (
        <Box
          data-testid="CompactPillsEmptyState"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 8
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {emptyMessage}
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
  )
}
