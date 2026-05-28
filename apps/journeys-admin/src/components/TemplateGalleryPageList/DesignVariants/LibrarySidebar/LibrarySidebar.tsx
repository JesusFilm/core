import { useDroppable } from '@dnd-kit/core'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { useTranslation } from 'next-i18next/pages'
import { ChangeEvent, ReactElement, useMemo, useState } from 'react'

import ChevronRightIcon from '@core/shared/ui/icons/ChevronRight'
import Inbox2Icon from '@core/shared/ui/icons/Inbox2'
import Plus2Icon from '@core/shared/ui/icons/Plus2'
import Search1Icon from '@core/shared/ui/icons/Search1'

import { TemplateGalleryPageStatus } from '../../../../../__generated__/globalTypes'
import logoGray from '../../../../../public/logo-grayscale.svg'
import { LabelChip } from '../../../LabelChip'
import { CollectionActionsMenu } from '../../CollectionActionsMenu'
import { DraggableJourneysGrid, encodeDropZoneId } from '../../Droppables'
import type { CollectionViewProps, TemplateGalleryPage } from '../types'

/**
 * "Library Sidebar" design-lab variant (NES-1695).
 *
 * Two-column desktop layout inspired by Spotify's Your Library / Apple
 * Music sidebar. A sticky left rail (~280px) carries a header with a
 * "Your Library" title and a stub Create (+) button, a search input, and
 * a scrollable list of rows: "All Templates" first, then one row per
 * collection. Each row shows a 32x32 thumbnail of the collection's first
 * template (with a grayscale logo fallback), the title, a status label
 * (Live / Draft) and a count, plus a chevron on hover hinting at "enter".
 *
 * Every row is registered as a dnd-kit drop target via `encodeDropZoneId`
 * so templates can be dragged from the grid in the right pane into a
 * collection in the rail. The All Templates row maps to the unsectioned
 * drop zone (drop here to ungroup). Published collections render a grey
 * dashed "blocked drop" affordance + tooltip, mirroring `CollectionChip`.
 *
 * Desktop only — the parent decides whether to render this variant. The
 * parent also owns the `DndContext`; this component must not create one.
 */
export function LibrarySidebar({
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

  // Case-insensitive title match. The All Templates row is rendered outside
  // the filtered loop so the search box can never hide the top-level filter.
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
      data-testid="LibrarySidebar"
      direction="row"
      spacing={0}
      sx={{
        // Give the rail room to scroll within while the right pane drives
        // overall height. Matches the FinderSidebar variant for visual parity.
        minHeight: 480,
        alignItems: 'stretch',
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'background.paper'
      }}
    >
      {/* LEFT — sticky vertical sidebar (~280px). Header + search pinned at
          the top, collection rows scroll within the remaining height. */}
      <Stack
        data-testid="LibrarySidebarRail"
        sx={{
          width: 280,
          flexShrink: 0,
          borderRight: 1,
          borderColor: 'divider',
          bgcolor: 'grey.50',
          position: 'sticky',
          top: 0,
          alignSelf: 'flex-start',
          maxHeight: '100vh'
        }}
      >
        {/* Library header — title + Create (+) stub button. */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {t('Your Library')}
          </Typography>
          <Tooltip title={t('Create collection')} arrow>
            <IconButton
              data-testid="LibrarySidebarCreateButton"
              size="small"
              aria-label={t('Create collection')}
            >
              <Plus2Icon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Search input. */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            value={search}
            onChange={handleSearchChange}
            placeholder={t('Search your library')}
            size="small"
            fullWidth
            inputProps={{ 'aria-label': t('Search your library') }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search1Icon fontSize="small" />
                </InputAdornment>
              )
            }}
          />
        </Box>

        {/* Scrollable list of rows. */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            py: 1
          }}
        >
          <LibraryRow
            testId="LibrarySidebarRow-all"
            title={t('All Templates')}
            count={allTemplatesCount}
            selected={selectedCollectionId === null}
            onSelect={handleSelectAll}
            dropZone={{ kind: 'unsectioned' }}
            dropDisabled={dropDisabled}
            isPublishedDropTarget={false}
            thumbnail={{ kind: 'allTemplates' }}
          />
          {visibleCollections.map((collection) => (
            <LibraryRow
              key={collection.id}
              testId={`LibrarySidebarRow-${collection.id}`}
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
              thumbnail={{
                kind: 'collection',
                src: collection.templates[0]?.primaryImageBlock?.src ?? null
              }}
            />
          ))}
        </Box>
      </Stack>

      {/* RIGHT — header strip + filtered grid. */}
      <Stack sx={{ flex: 1, minWidth: 0, p: 3 }} spacing={2}>
        <LibraryHeaderStrip
          selectedCollection={selectedCollection}
          count={filteredJourneys.length}
          onEdit={onEdit}
          onOpenPublish={onOpenPublish}
          onUngroup={onUngroup}
          busyId={busyId}
          canPublish={canPublish}
          publishBlockedReason={publishBlockedReason}
        />

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

type LibraryRowThumbnail =
  | { kind: 'allTemplates' }
  | { kind: 'collection'; src: string | null }

interface LibraryRowProps {
  testId: string
  title: string
  count: number
  selected: boolean
  onSelect: () => void
  dropZone: { kind: 'unsectioned' } | { kind: 'collection'; id: string }
  dropDisabled: boolean
  isPublishedDropTarget: boolean
  statusLabel?: { color: 'default' | 'success'; label: string }
  thumbnail: LibraryRowThumbnail
}

/**
 * Individual library row. ~48px tall, contains a 32x32 thumbnail, the
 * title, a small status label, a count, and a chevron that reveals on
 * hover to hint at "enter". Owns its own `useDroppable` so each row
 * independently responds to drag-over. The dashed "blocked" affordance +
 * tooltip is mirrored from `CollectionChip` for visual consistency.
 */
function LibraryRow({
  testId,
  title,
  count,
  selected,
  onSelect,
  dropZone,
  dropDisabled,
  isPublishedDropTarget,
  statusLabel,
  thumbnail
}: LibraryRowProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { setNodeRef, isOver } = useDroppable({
    id: encodeDropZoneId(dropZone),
    disabled: dropDisabled
  })

  // Drop blocked = drag is over a published collection (the parent rejects
  // the drop). We still register the droppable so the affordance can render
  // — only hard locks (busy / dialog) fully disable it.
  const dropBlocked = isOver && isPublishedDropTarget
  const active = selected || (isOver && !isPublishedDropTarget)

  // Resolve the four border colors up front so the sx object literal stays
  // free of spread-overwrite hazards (TS2783) while still expressing the
  // three states: idle, drop-target, blocked.
  let borderColor: string = 'transparent'
  let borderLeftColor: string = selected ? 'primary.main' : 'transparent'
  if (dropBlocked) {
    borderColor = 'text.disabled'
    borderLeftColor = 'text.disabled'
  } else if (active && !selected) {
    borderColor = 'primary.main'
    borderLeftColor = 'primary.main'
  }

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
          minHeight: 48,
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          textAlign: 'left',
          // Border accent doubles as the selection cue without pushing
          // content around (transparent on inactive rows). Colors are
          // resolved above so the sx literal stays free of duplicate-key
          // overwrites across the three states (idle, drop target, blocked).
          border: 1,
          borderStyle: dropBlocked ? 'dashed' : 'solid',
          borderColor,
          borderLeftWidth: 3,
          borderLeftStyle: 'solid',
          borderLeftColor,
          bgcolor: selected ? 'action.selected' : 'transparent',
          cursor: dropBlocked ? 'not-allowed' : undefined,
          '&:hover': {
            bgcolor: selected ? 'action.selected' : 'action.hover'
          },
          '&:hover .LibrarySidebarRowChevron': {
            opacity: 1
          },
          transition: 'background-color 120ms ease, border-color 120ms ease'
        }}
      >
        <LibraryRowThumbnailBox thumbnail={thumbnail} />
        <Stack sx={{ flex: 1, minWidth: 0 }} spacing={0.25}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.75}
            sx={{ minWidth: 0 }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontWeight: selected ? 600 : 500
              }}
            >
              {title}
            </Typography>
            {statusLabel != null && (
              <LabelChip
                color={statusLabel.color}
                label={statusLabel.label}
                sx={{
                  // Compact label sized for the 48px row.
                  height: 18,
                  fontSize: 10,
                  lineHeight: '14px',
                  px: 1,
                  flexShrink: 0
                }}
              />
            )}
          </Stack>
          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            sx={{ minWidth: 0 }}
          >
            {t('{{count}} templates', {
              count,
              defaultValue_one: '{{count}} template',
              defaultValue_other: '{{count}} templates'
            })}
          </Typography>
        </Stack>
        <ChevronRightIcon
          className="LibrarySidebarRowChevron"
          fontSize="small"
          sx={{
            color: 'text.secondary',
            flexShrink: 0,
            opacity: selected ? 1 : 0,
            transition: 'opacity 120ms ease'
          }}
        />
      </ButtonBase>
    </Tooltip>
  )
}

interface LibraryRowThumbnailBoxProps {
  thumbnail: LibraryRowThumbnail
}

/**
 * 32x32 thumbnail slot for a library row. Renders the inbox icon for the
 * All Templates row, the collection's first template image when present,
 * or the grayscale logo fallback otherwise.
 */
function LibraryRowThumbnailBox({
  thumbnail
}: LibraryRowThumbnailBoxProps): ReactElement {
  if (thumbnail.kind === 'allTemplates') {
    return (
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: 1,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.200',
          color: 'text.secondary'
        }}
      >
        <Inbox2Icon fontSize="small" />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: 32,
        height: 32,
        borderRadius: 1,
        overflow: 'hidden',
        flexShrink: 0,
        bgcolor: 'grey.200'
      }}
    >
      {thumbnail.src != null ? (
        <Image
          src={thumbnail.src}
          alt=""
          fill
          sizes="32px"
          style={{ objectFit: 'cover' }}
        />
      ) : (
        <Image
          src={logoGray}
          alt=""
          width={20}
          height={20}
          style={{
            objectFit: 'contain',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
      )}
    </Box>
  )
}

interface LibraryHeaderStripProps {
  selectedCollection: TemplateGalleryPage | null
  count: number
  onEdit: (collection: TemplateGalleryPage) => void
  onOpenPublish: (collection: TemplateGalleryPage) => void
  onUngroup: (collection: TemplateGalleryPage) => void
  busyId: string | null
  canPublish: boolean
  publishBlockedReason: string | null
}

/**
 * Top-of-the-right-pane strip. Shows the selected collection name (or
 * "All Templates"), the visible template count, and — when a collection
 * is active — the 3-dot actions menu. All Templates is not a managed
 * entity so the menu is hidden there.
 */
function LibraryHeaderStrip({
  selectedCollection,
  count,
  onEdit,
  onOpenPublish,
  onUngroup,
  busyId,
  canPublish,
  publishBlockedReason
}: LibraryHeaderStripProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const name = selectedCollection?.title ?? t('All Templates')

  return (
    <Stack
      data-testid="LibrarySidebarHeader"
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
          {name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ flexShrink: 0 }}
        >
          {t('({{count}} templates)', {
            count,
            defaultValue_one: '({{count}} template)',
            defaultValue_other: '({{count}} templates)'
          })}
        </Typography>
      </Stack>
      {selectedCollection != null && (
        <CollectionActionsMenu
          collection={selectedCollection}
          onEdit={onEdit}
          onPublish={onOpenPublish}
          onUngroup={onUngroup}
          busy={busyId === selectedCollection.id}
          canPublish={canPublish}
          publishBlockedReason={publishBlockedReason}
          testIdSuffix="library-sidebar"
        />
      )}
    </Stack>
  )
}

interface EmptyStateProps {
  hasSelectedCollection: boolean
  allTemplatesCount: number
}

/**
 * Centered message shown when no templates match the current filter. The
 * copy is tailored to whether a specific collection is selected (drop
 * hint) versus All Templates (team-empty vs everything-grouped).
 */
function EmptyState({
  hasSelectedCollection,
  allTemplatesCount
}: EmptyStateProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

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
      data-testid="LibrarySidebarEmpty"
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
