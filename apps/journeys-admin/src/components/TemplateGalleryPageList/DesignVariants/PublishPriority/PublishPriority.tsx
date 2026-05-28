import { useDroppable } from '@dnd-kit/core'
import AllInboxIcon from '@mui/icons-material/AllInbox'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Grid from '@mui/material/Grid'
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
 * "Publish Priority" design-lab variant (NES-1695).
 *
 * Publishing-first single-column layout. Collections are split into three
 * status-sorted sections so the user's eye lands on the work that needs
 * attention before the folder picker is even noticed:
 *
 * 1. NEEDS PUBLISHING — draft collections that already have templates. These
 *    cards are deliberately the largest in the layout and carry a prominent
 *    contained PUBLISH button, making publishing the dominant action.
 * 2. Empty — draft collections with no templates yet. Rendered as smaller,
 *    muted cards that read clearly as drop targets but do not compete for
 *    attention.
 * 3. Published — already-live collections. Smaller and de-emphasised so they
 *    drop into the background once their job is done.
 *
 * The folder picker (all three sections + the All Templates browse tile) is
 * therefore visually secondary — present and usable, but never out-shouting
 * the PUBLISH affordances. A top banner counts the drafts ready for publish
 * to reinforce the call to action.
 */
export function PublishPriority({
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

  // Within each section, sort by updatedAt desc, fall back to title asc, so
  // the most recently touched draft/published collection floats to the top.
  const { needsPublishing, emptyDrafts, published } = useMemo(() => {
    const sorted = [...collections].sort(compareByUpdatedThenTitle)
    const needs: TemplateGalleryPage[] = []
    const empty: TemplateGalleryPage[] = []
    const live: TemplateGalleryPage[] = []
    for (const collection of sorted) {
      if (collection.status === TemplateGalleryPageStatus.published) {
        live.push(collection)
        continue
      }
      if (collection.templates.length > 0) {
        needs.push(collection)
        continue
      }
      empty.push(collection)
    }
    return { needsPublishing: needs, emptyDrafts: empty, published: live }
  }, [collections])

  function handleSelectAll(): void {
    onSelectCollection(null)
  }

  function handleSelectCollection(id: string): void {
    onSelectCollection(id)
  }

  function handleOpenPublish(collection: TemplateGalleryPage): void {
    onOpenPublish(collection)
  }

  const showBanner = needsPublishing.length > 0

  return (
    <Stack data-testid="PublishPriority" spacing={3} sx={{ minWidth: 0 }}>
      {showBanner && (
        <Stack
          data-testid="PublishPriorityBanner"
          direction="row"
          alignItems="flex-start"
          spacing={1.5}
          sx={{
            p: 2,
            borderRadius: 2,
            // Primary-tinted banner so the publish count is the first thing
            // the eye lands on when entering the panel.
            bgcolor: 'primary.light',
            color: 'primary.contrastText'
          }}
        >
          <WarningAmberIcon sx={{ color: 'inherit', mt: '2px' }} />
          <Stack spacing={0.25} sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {t('{{count}} collections need publishing', {
                count: needsPublishing.length,
                defaultValue_one: '{{count}} collection needs publishing',
                defaultValue_other: '{{count}} collections need publishing'
              })}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {t(
                'Drag templates into a collection to get it ready to publish.'
              )}
            </Typography>
          </Stack>
        </Stack>
      )}

      {/* All Templates browse tile — pinned above the sections, intentionally
          small so it never competes with the publish CTAs below. */}
      <Box>
        <AllTemplatesBrowseCard
          count={allTemplatesCount}
          selected={selectedCollectionId === null}
          onSelect={handleSelectAll}
          dropDisabled={dropDisabled}
        />
      </Box>

      {/* SECTION 1 — Needs publishing. The visually loudest section: tinted
          header background, larger cards, contained PUBLISH button. */}
      <Stack spacing={1.5}>
        <Box
          sx={{
            px: 1.5,
            py: 1,
            borderRadius: 1,
            bgcolor: 'primary.light',
            color: 'primary.contrastText'
          }}
        >
          <Typography
            component="h3"
            variant="overline"
            sx={{ fontWeight: 700, letterSpacing: 1 }}
          >
            {t('Needs publishing')}
          </Typography>
        </Box>
        {needsPublishing.length === 0 ? (
          <Box
            data-testid="PublishPriorityNeedsPublishingEmpty"
            sx={{
              py: 4,
              px: 2,
              textAlign: 'center',
              borderRadius: 2,
              border: 1,
              borderStyle: 'dashed',
              borderColor: 'divider'
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {t(
                'All caught up! ✓ Every collection is either empty or published.'
              )}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {needsPublishing.map((collection) => (
              <Grid key={collection.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <NeedsPublishingCard
                  collection={collection}
                  selected={selectedCollectionId === collection.id}
                  onSelect={handleSelectCollection}
                  onOpenPublish={handleOpenPublish}
                  dropDisabled={dropDisabled}
                  busy={busyId === collection.id}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>

      {/* SECTION 2 — Empty drafts. Section header is hidden when empty so
          the layout doesn't grow whitespace it can't justify. */}
      {emptyDrafts.length > 0 && (
        <Stack spacing={1.5}>
          <Typography
            component="h3"
            variant="overline"
            color="text.secondary"
            sx={{ fontWeight: 700, letterSpacing: 1 }}
          >
            {t('Empty')}
          </Typography>
          <Grid container spacing={2}>
            {emptyDrafts.map((collection) => (
              <Grid key={collection.id} size={{ xs: 6, sm: 4, md: 3 }}>
                <EmptyCollectionCard
                  collection={collection}
                  selected={selectedCollectionId === collection.id}
                  onSelect={handleSelectCollection}
                  dropDisabled={dropDisabled}
                />
              </Grid>
            ))}
          </Grid>
        </Stack>
      )}

      {/* SECTION 3 — Published. Muted; cards register as drop targets only
          to surface the "can't drop here" tooltip, mirroring CollectionChip. */}
      {published.length > 0 && (
        <Stack spacing={1.5}>
          <Typography
            component="h3"
            variant="overline"
            color="text.secondary"
            sx={{ fontWeight: 700, letterSpacing: 1 }}
          >
            {t('Published')}
          </Typography>
          <Grid container spacing={2}>
            {published.map((collection) => (
              <Grid key={collection.id} size={{ xs: 6, sm: 4, md: 3 }}>
                <PublishedCollectionCard
                  collection={collection}
                  selected={selectedCollectionId === collection.id}
                  onSelect={handleSelectCollection}
                  dropDisabled={dropDisabled}
                />
              </Grid>
            ))}
          </Grid>
        </Stack>
      )}

      {/* Below — the standard filter header + templates grid. */}
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
            data-testid="PublishPriorityEmptyTemplates"
            sx={{ py: 8, px: 4, textAlign: 'center' }}
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

function compareByUpdatedThenTitle(
  a: TemplateGalleryPage,
  b: TemplateGalleryPage
): number {
  // updatedAt is an ISO string in this schema; lexical sort is correct for
  // ISO-8601 timestamps. Most recent first.
  if (a.updatedAt !== b.updatedAt) {
    return a.updatedAt < b.updatedAt ? 1 : -1
  }
  return a.title.localeCompare(b.title)
}

interface AllTemplatesBrowseCardProps {
  count: number
  selected: boolean
  onSelect: () => void
  dropDisabled: boolean
}

/**
 * Compact "Browse All" tile pinned above the sections. Maps to the
 * unsectioned drop zone — dropping here ungroups the template. Kept small
 * by design so it doesn't compete with the publish CTAs below.
 */
function AllTemplatesBrowseCard({
  count,
  selected,
  onSelect,
  dropDisabled
}: AllTemplatesBrowseCardProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { setNodeRef, isOver } = useDroppable({
    id: encodeDropZoneId({ kind: 'unsectioned' }),
    disabled: dropDisabled
  })
  const active = selected || isOver

  return (
    <ButtonBase
      data-testid="PublishPriorityAllTemplatesCard"
      ref={setNodeRef}
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={t('All Templates')}
      sx={{
        width: { xs: '100%', sm: 240 },
        height: 64,
        px: 2,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        textAlign: 'left',
        gap: 1.5,
        borderRadius: 2,
        border: 1,
        borderColor: active ? 'primary.main' : 'divider',
        bgcolor: 'background.paper',
        transition: 'border-color 120ms ease, box-shadow 120ms ease',
        '&:hover': { boxShadow: 1 }
      }}
    >
      <AllInboxIcon sx={{ fontSize: 24, color: 'text.secondary' }} />
      <Stack spacing={0} sx={{ minWidth: 0 }}>
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

interface NeedsPublishingCardProps {
  collection: TemplateGalleryPage
  selected: boolean
  onSelect: (id: string) => void
  onOpenPublish: (collection: TemplateGalleryPage) => void
  dropDisabled: boolean
  busy: boolean
}

/**
 * Large draft-with-templates card — the dominant visual unit of the variant.
 * Carries a full-width contained PUBLISH button that stopPropagation's so the
 * card click (select) and the button click (publish flow) stay separate.
 */
function NeedsPublishingCard({
  collection,
  selected,
  onSelect,
  onOpenPublish,
  dropDisabled,
  busy
}: NeedsPublishingCardProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const count = collection.templates.length

  const { setNodeRef, isOver } = useDroppable({
    id: encodeDropZoneId({ kind: 'collection', id: collection.id }),
    disabled: dropDisabled
  })
  const active = selected || isOver

  function handleSelectClick(): void {
    onSelect(collection.id)
  }

  function handleSelectKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect(collection.id)
    }
  }

  function handlePublishClick(event: MouseEvent<HTMLButtonElement>): void {
    event.stopPropagation()
    onOpenPublish(collection)
  }

  // The outer card is a plain Box (not a button) so the contained PUBLISH
  // <button> can sit inside it without violating "<button> cannot contain a
  // nested <button>". We instead apply role="button" + keyboard handlers to
  // a non-button selectable region wrapping the title / metadata, leaving
  // PUBLISH as the only real <button> in the card.
  return (
    <Box
      ref={setNodeRef}
      data-testid={`PublishPriorityNeedsCard-${collection.id}-container`}
      sx={{
        width: '100%',
        minHeight: 180,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'space-between',
        textAlign: 'left',
        borderRadius: 2,
        border: 1,
        borderColor: active ? 'primary.main' : 'divider',
        bgcolor: 'background.paper',
        // Soft drop-shadow lift so the publish-ready cards visually rise
        // above the muted Empty / Published cards below.
        boxShadow: 1,
        transition: 'border-color 120ms ease, box-shadow 120ms ease',
        '&:hover': { boxShadow: 3 }
      }}
    >
      <Box
        role="button"
        tabIndex={0}
        data-testid={`PublishPriorityNeedsCard-${collection.id}`}
        aria-pressed={selected}
        aria-label={collection.title}
        onClick={handleSelectClick}
        onKeyDown={handleSelectKeyDown}
        sx={{
          width: '100%',
          minWidth: 0,
          cursor: 'pointer',
          // Reset default focus styling — the card-level border colour above
          // already conveys focus/selected/over states.
          outline: 'none',
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: 2,
            borderRadius: 4
          }
        }}
      >
        <Stack spacing={1} sx={{ width: '100%', minWidth: 0 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {collection.title}
            </Typography>
            <LabelChip
              data-testid={`PublishPriorityNeedsCard-${collection.id}-status`}
              color="default"
              label={t('Draft')}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {t('{{count}} templates', {
              count,
              defaultValue_one: '{{count}} template',
              defaultValue_other: '{{count}} templates'
            })}
          </Typography>
        </Stack>
      </Box>
      <Button
        data-testid={`PublishPriorityNeedsCard-${collection.id}-publish`}
        variant="contained"
        color="primary"
        startIcon={<CloudUploadIcon />}
        onClick={handlePublishClick}
        disabled={busy}
        fullWidth
        sx={{ mt: 2, fontWeight: 700 }}
      >
        {t('Publish')}
      </Button>
    </Box>
  )
}

interface EmptyCollectionCardProps {
  collection: TemplateGalleryPage
  selected: boolean
  onSelect: (id: string) => void
  dropDisabled: boolean
}

/**
 * Small muted card for an empty draft collection. Reads as a drop target;
 * no publish CTA because there's nothing to publish yet.
 */
function EmptyCollectionCard({
  collection,
  selected,
  onSelect,
  dropDisabled
}: EmptyCollectionCardProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const { setNodeRef, isOver } = useDroppable({
    id: encodeDropZoneId({ kind: 'collection', id: collection.id }),
    disabled: dropDisabled
  })
  const active = selected || isOver

  function handleClick(): void {
    onSelect(collection.id)
  }

  return (
    <ButtonBase
      data-testid={`PublishPriorityEmptyCard-${collection.id}`}
      ref={setNodeRef}
      onClick={handleClick}
      aria-pressed={selected}
      aria-label={collection.title}
      sx={{
        width: '100%',
        minHeight: 100,
        p: 1.5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        textAlign: 'left',
        borderRadius: 2,
        border: 1,
        borderStyle: 'dashed',
        borderColor: active ? 'primary.main' : 'divider',
        bgcolor: 'action.hover',
        transition: 'border-color 120ms ease'
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 600,
          color: 'text.secondary',
          width: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {collection.title}
      </Typography>
      <Typography variant="caption" color="text.disabled">
        {t('Drag templates here')}
      </Typography>
    </ButtonBase>
  )
}

interface PublishedCollectionCardProps {
  collection: TemplateGalleryPage
  selected: boolean
  onSelect: (id: string) => void
  dropDisabled: boolean
}

/**
 * Small muted card for a published collection. Stays registered as a drop
 * target so a drag-over surfaces the "can't drop here" tooltip + dashed
 * border (mirroring CollectionChip); the dispatcher rejects the drop.
 */
function PublishedCollectionCard({
  collection,
  selected,
  onSelect,
  dropDisabled
}: PublishedCollectionCardProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const count = collection.templates.length

  const { setNodeRef, isOver } = useDroppable({
    id: encodeDropZoneId({ kind: 'collection', id: collection.id }),
    disabled: dropDisabled
  })
  const dropBlocked = isOver
  const active = selected

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
        data-testid={`PublishPriorityPublishedCard-${collection.id}`}
        ref={setNodeRef}
        onClick={handleClick}
        aria-pressed={selected}
        aria-label={collection.title}
        sx={{
          width: '100%',
          minHeight: 100,
          p: 1.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          textAlign: 'left',
          borderRadius: 2,
          border: 1,
          borderStyle: dropBlocked ? 'dashed' : 'solid',
          borderColor: dropBlocked
            ? 'text.disabled'
            : active
              ? 'primary.main'
              : 'divider',
          // De-emphasised background so published cards recede behind the
          // larger NEEDS PUBLISHING cards above.
          bgcolor: 'grey.50',
          cursor: dropBlocked ? 'not-allowed' : undefined,
          transition: 'border-color 120ms ease'
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
          sx={{ width: '100%' }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {collection.title}
          </Typography>
          <LabelChip
            data-testid={`PublishPriorityPublishedCard-${collection.id}-status`}
            color="success"
            label={t('Live')}
          />
        </Stack>
        <Typography variant="caption" color="text.secondary">
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
