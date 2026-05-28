import { useDroppable } from '@dnd-kit/core'
import AllInboxIcon from '@mui/icons-material/AllInbox'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { KeyboardEvent, MouseEvent, ReactElement, useMemo } from 'react'

import { TemplateGalleryPageStatus } from '../../../../../__generated__/globalTypes'
import { LabelChip } from '../../../LabelChip'
import { DraggableJourneysGrid, encodeDropZoneId } from '../../Droppables'
import { MobileFilterHeaderStrip } from '../../MobileFilterHeaderStrip'
import type { CollectionViewProps, TemplateGalleryPage } from '../types'

/**
 * "Publish Pipeline" design-lab variant (NES-1695).
 *
 * Kanban-by-status layout that enforces publishing as the visually dominant
 * action and demotes the folder/collection picker to a secondary role. Three
 * columns — DRAFT (empty drafts), READY (drafts with templates, the primary
 * CTA column), and LIVE (already-published) — render collection cards. Only
 * the READY column carries a loud, filled-primary PUBLISH button; selection
 * highlighting on cards is intentionally subtle so it never competes with
 * that CTA. An "All Templates" strip sits above the columns as a filter +
 * unsectioned drop target. Below the kanban the active filter's header and
 * its templates grid (or an empty state) render so the kanban replaces only
 * the chip row, not the whole panel.
 *
 * Each card doubles as a dnd-kit drop target via `encodeDropZoneId`. LIVE
 * cards keep the drop target registered so a drag-over surfaces the
 * "blocked" dashed border + tooltip (mirroring `CollectionChip`) while the
 * parent rejects the drop. Desktop only — the parent gates rendering.
 */
export function PublishPipeline({
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

  // Bucket collections into the three kanban columns. Sorting is by
  // `updatedAt` desc so the most-recently-touched collection bubbles to the
  // top of its column — that matches user intent (you just changed it, you
  // probably want to act on it next).
  const { draftCollections, readyCollections, liveCollections } =
    useMemo(() => {
      const draft: TemplateGalleryPage[] = []
      const ready: TemplateGalleryPage[] = []
      const live: TemplateGalleryPage[] = []
      for (const collection of collections) {
        if (collection.status === TemplateGalleryPageStatus.published) {
          live.push(collection)
          continue
        }
        if (collection.templates.length === 0) {
          draft.push(collection)
          continue
        }
        ready.push(collection)
      }
      const byUpdatedDesc = (
        a: TemplateGalleryPage,
        b: TemplateGalleryPage
      ): number =>
        a.updatedAt < b.updatedAt ? 1 : a.updatedAt > b.updatedAt ? -1 : 0
      return {
        draftCollections: [...draft].sort(byUpdatedDesc),
        readyCollections: [...ready].sort(byUpdatedDesc),
        liveCollections: [...live].sort(byUpdatedDesc)
      }
    }, [collections])

  function handleSelectAll(): void {
    onSelectCollection(null)
  }

  function handleSelectCollection(id: string): void {
    onSelectCollection(id)
  }

  return (
    <Stack data-testid="PublishPipeline" spacing={3} sx={{ minWidth: 0 }}>
      {/* All Templates strip — sits ABOVE the kanban columns so it reads as
          a filter, not as a fourth status column. */}
      <AllTemplatesStrip
        count={allTemplatesCount}
        selected={selectedCollectionId === null}
        onSelect={handleSelectAll}
        dropDisabled={dropDisabled}
      />

      {/* Kanban — three flex columns. */}
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: 'flex-start', minWidth: 0 }}
      >
        <KanbanColumn
          variant="draft"
          title={t('Draft')}
          collections={draftCollections}
          selectedCollectionId={selectedCollectionId}
          onSelectCollection={handleSelectCollection}
          onOpenPublish={onOpenPublish}
          onEdit={onEdit}
          dropDisabled={dropDisabled}
          busyId={busyId}
          emptyMessage={t('No drafts.')}
        />
        <KanbanColumn
          variant="ready"
          title={t('Ready')}
          collections={readyCollections}
          selectedCollectionId={selectedCollectionId}
          onSelectCollection={handleSelectCollection}
          onOpenPublish={onOpenPublish}
          onEdit={onEdit}
          dropDisabled={dropDisabled}
          busyId={busyId}
          emptyMessage={t('No collections ready.')}
        />
        <KanbanColumn
          variant="live"
          title={t('Live')}
          collections={liveCollections}
          selectedCollectionId={selectedCollectionId}
          onSelectCollection={handleSelectCollection}
          onOpenPublish={onOpenPublish}
          onEdit={onEdit}
          dropDisabled={dropDisabled}
          busyId={busyId}
          emptyMessage={t('Nothing published yet.')}
        />
      </Stack>

      {/* BELOW — the active filter's header strip + templates grid (or empty
          state). The same surface the other variants use, so switching
          variants only changes the picker. */}
      <Stack spacing={2}>
        <MobileFilterHeaderStrip
          selectedCollection={selectedCollection}
          count={filteredJourneys.length}
          onEdit={onEdit}
          onPublish={onOpenPublish}
          onUngroup={onUngroup}
          busy={selectedCollection != null && busyId === selectedCollection.id}
          canPublish={canPublish}
          publishBlockedReason={publishBlockedReason}
        />
        {filteredJourneys.length === 0 ? (
          <Box
            data-testid="PublishPipelineEmptyTemplates"
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

type KanbanColumnVariant = 'draft' | 'ready' | 'live'

interface KanbanColumnProps {
  variant: KanbanColumnVariant
  title: string
  collections: readonly TemplateGalleryPage[]
  selectedCollectionId: string | null
  onSelectCollection: (id: string) => void
  onOpenPublish: (collection: TemplateGalleryPage) => void
  onEdit: (collection: TemplateGalleryPage) => void
  dropDisabled: boolean
  busyId: string | null
  emptyMessage: string
}

/**
 * One column in the kanban. The READY column header gets a primary-tinted
 * background to draw the eye there; DRAFT and LIVE headers stay neutral so
 * the visual hierarchy reinforces "publish is what matters".
 */
function KanbanColumn({
  variant,
  title,
  collections,
  selectedCollectionId,
  onSelectCollection,
  onOpenPublish,
  onEdit,
  dropDisabled,
  busyId,
  emptyMessage
}: KanbanColumnProps): ReactElement {
  const isReady = variant === 'ready'
  return (
    <Stack
      data-testid={`PublishPipelineColumn-${variant}`}
      sx={{
        flex: 1,
        minWidth: 260,
        // The column itself is a vertical scroll container so long lists of
        // collections don't push the page; the sticky header stays in view.
        maxHeight: '70vh',
        overflowY: 'auto',
        borderRadius: 2,
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper'
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          px: 2,
          py: 1.5,
          // READY header is tinted primary so the eye lands on the publish
          // column first; the loud per-card PUBLISH buttons reinforce that.
          bgcolor: isReady ? 'primary.light' : 'background.paper',
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Typography
          component="h3"
          variant="subtitle2"
          sx={{
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            color: isReady ? 'primary.contrastText' : 'text.primary',
            fontWeight: 700
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: isReady ? 'primary.contrastText' : 'text.secondary',
            opacity: isReady ? 0.85 : 1
          }}
        >
          ({collections.length})
        </Typography>
      </Stack>

      <Stack spacing={2} sx={{ p: 2 }}>
        {collections.length === 0 ? (
          <Typography
            data-testid={`PublishPipelineColumn-${variant}-empty`}
            variant="body2"
            color="text.secondary"
          >
            {emptyMessage}
          </Typography>
        ) : (
          collections.map((collection) => (
            <CollectionCard
              key={collection.id}
              variant={variant}
              collection={collection}
              selected={selectedCollectionId === collection.id}
              onSelect={onSelectCollection}
              onOpenPublish={onOpenPublish}
              onEdit={onEdit}
              dropDisabled={dropDisabled}
              busy={busyId === collection.id}
            />
          ))
        )}
      </Stack>
    </Stack>
  )
}

interface CollectionCardProps {
  variant: KanbanColumnVariant
  collection: TemplateGalleryPage
  selected: boolean
  onSelect: (id: string) => void
  onOpenPublish: (collection: TemplateGalleryPage) => void
  onEdit: (collection: TemplateGalleryPage) => void
  dropDisabled: boolean
  busy: boolean
}

/**
 * A single collection card in a kanban column. Title + count on top, a
 * status-appropriate action row on the bottom. The READY card carries the
 * loud filled-primary PUBLISH button — the primary CTA of the variant. The
 * DRAFT card (empty collection) carries only a muted "drag templates here"
 * hint so it reads as a destination, not an action. The LIVE card shows the
 * green LIVE label + a small Edit button (no Publish — already published).
 *
 * Selection highlighting is deliberately subtle (a thin outline) so it
 * doesn't visually compete with the PUBLISH CTA.
 */
function CollectionCard({
  variant,
  collection,
  selected,
  onSelect,
  onOpenPublish,
  onEdit,
  dropDisabled,
  busy
}: CollectionCardProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const isLive = variant === 'live'
  const isReady = variant === 'ready'
  const count = collection.templates.length

  const { setNodeRef, isOver } = useDroppable({
    id: encodeDropZoneId({ kind: 'collection', id: collection.id }),
    // LIVE cards stay a registered drop target so the "blocked" affordance
    // can render on drag-over; the parent rejects the actual drop. Only the
    // hard locks (busy / open dialog) fully disable the target.
    disabled: dropDisabled
  })
  const dropBlocked = isOver && isLive
  const active = selected || (isOver && !isLive)

  const statusLabel = isLive
    ? t('Live')
    : isReady
      ? t('Ready to publish')
      : t('Draft')
  const ariaLabel = t('{{title}}, {{status}}, {{count}} templates', {
    title: collection.title,
    status: statusLabel,
    count,
    defaultValue_one: '{{title}}, {{status}}, {{count}} template',
    defaultValue_other: '{{title}}, {{status}}, {{count}} templates'
  })

  function handleSelect(): void {
    onSelect(collection.id)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleSelect()
    }
  }

  function handlePublish(event: MouseEvent<HTMLButtonElement>): void {
    // Buttons share the card's click area, so stop propagation to keep
    // PUBLISH and Edit clicks from also firing card selection.
    event.stopPropagation()
    onOpenPublish(collection)
  }

  function handleEdit(event: MouseEvent<HTMLButtonElement>): void {
    event.stopPropagation()
    onEdit(collection)
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
      {/* role="button" + onKeyDown rather than ButtonBase so the per-card
          PUBLISH / Edit Buttons don't nest a <button> inside a <button>,
          which is invalid HTML and trips React's DOM-nesting warning. */}
      <Box
        data-testid={`PublishPipelineCard-${collection.id}`}
        ref={setNodeRef}
        role="button"
        tabIndex={0}
        onClick={handleSelect}
        onKeyDown={handleKeyDown}
        aria-pressed={selected}
        aria-label={ariaLabel}
        sx={{
          width: '100%',
          minHeight: 120,
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          textAlign: 'left',
          borderRadius: 2,
          border: 1,
          borderStyle: dropBlocked ? 'dashed' : 'solid',
          borderColor: dropBlocked
            ? 'text.disabled'
            : active
              ? 'primary.main'
              : 'divider',
          bgcolor: 'background.paper',
          // Subtle outline for the active card so it doesn't compete with
          // the PUBLISH CTAs in the READY column.
          outline: selected ? '1px solid' : 'none',
          outlineColor: 'primary.main',
          outlineOffset: -1,
          cursor: dropBlocked ? 'not-allowed' : 'pointer',
          transition: 'border-color 120ms ease, outline-color 120ms ease',
          '&:hover': { boxShadow: 1 },
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: 2
          }
        }}
      >
        <Stack spacing={0.5} sx={{ width: '100%' }}>
          <Typography
            variant="subtitle2"
            noWrap
            sx={{ fontWeight: 600, width: '100%' }}
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
        </Stack>

        <Box sx={{ flex: 1 }} />

        <Box sx={{ width: '100%', mt: 2 }}>
          {isReady && (
            <Button
              data-testid={`PublishPipelineCard-${collection.id}-publish`}
              variant="contained"
              color="primary"
              fullWidth
              disabled={busy}
              startIcon={<CloudUploadIcon />}
              onClick={handlePublish}
              sx={{ fontWeight: 700 }}
            >
              {t('Publish')}
            </Button>
          )}
          {!isReady && !isLive && (
            <Typography
              data-testid={`PublishPipelineCard-${collection.id}-empty-hint`}
              variant="caption"
              color="text.secondary"
              sx={{ fontStyle: 'italic' }}
            >
              {t('Empty — drag templates here')}
            </Typography>
          )}
          {isLive && (
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={1}
            >
              <LabelChip
                data-testid={`PublishPipelineCard-${collection.id}-status`}
                color="success"
                label={t('Live')}
              />
              <Button
                data-testid={`PublishPipelineCard-${collection.id}-edit`}
                size="small"
                onClick={handleEdit}
                disabled={busy}
              >
                {t('Edit')}
              </Button>
            </Stack>
          )}
        </Box>
      </Box>
    </Tooltip>
  )
}

interface AllTemplatesStripProps {
  count: number
  selected: boolean
  onSelect: () => void
  dropDisabled: boolean
}

/**
 * Horizontal "All Templates" strip above the kanban. Doubles as the
 * unsectioned drop zone (dropping a template here ungroups it). Sits
 * outside the three status columns so it reads as a filter, not a status.
 */
function AllTemplatesStrip({
  count,
  selected,
  onSelect,
  dropDisabled
}: AllTemplatesStripProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { setNodeRef, isOver } = useDroppable({
    id: encodeDropZoneId({ kind: 'unsectioned' }),
    disabled: dropDisabled
  })
  const active = selected || isOver

  return (
    <ButtonBase
      data-testid="PublishPipelineAllTemplatesStrip"
      ref={setNodeRef}
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={t('All Templates')}
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        textAlign: 'left',
        px: 2,
        py: 1.5,
        borderRadius: 2,
        border: 1,
        borderColor: active ? 'primary.main' : 'divider',
        bgcolor: 'action.hover',
        transition: 'border-color 120ms ease',
        '&:hover': { boxShadow: 1 }
      }}
    >
      <AllInboxIcon sx={{ fontSize: 24, color: 'primary.main', mr: 1.5 }} />
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
          {t('All Templates')}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {t('{{count}} templates', {
            count,
            defaultValue_one: '{{count}} template',
            defaultValue_other: '{{count}} templates'
          })}
        </Typography>
      </Stack>
    </ButtonBase>
  )
}
