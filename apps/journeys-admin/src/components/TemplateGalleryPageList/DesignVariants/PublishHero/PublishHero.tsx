import { useDndContext, useDroppable } from '@dnd-kit/core'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ChangeEvent, ReactElement, useMemo, useState } from 'react'

import Plus2Icon from '@core/shared/ui/icons/Plus2'
import Search1Icon from '@core/shared/ui/icons/Search1'
import Upload1Icon from '@core/shared/ui/icons/Upload1'

import { TemplateGalleryPageStatus } from '../../../../../__generated__/globalTypes'
import { LabelChip } from '../../../LabelChip'
import { DraggableJourneysGrid, encodeDropZoneId } from '../../Droppables'
import type { CollectionViewProps, TemplateGalleryPage } from '../types'

/**
 * "Publish Hero" design-lab variant (NES-1695).
 *
 * Publish-first layout: the right pane is dominated by a hero card whose
 * primary CTA is "PUBLISH NOW" for the selected draft collection. The left
 * sidebar is intentionally minimal — a thin column of folder rows for
 * navigation only, with no thumbnails, no status labels and no decorative
 * chrome. The hero card carries the status (DRAFT, EMPTY, LIVE) and the
 * action surface, so the sidebar can read as visually quieter and the
 * publish action is unmistakably the dominant element on screen.
 *
 * The hero swaps its content based on the selected collection's state:
 *  - draft with templates: bright primary-tinted card + full-width PUBLISH NOW CTA.
 *  - draft without templates: muted card + drop-template helper text, no CTA.
 *  - published: success-tinted card with the LIVE label, no publish CTA.
 *  - All Templates: explainer card with a callout when drafts are ready.
 *
 * Every sidebar row (including All Templates) is registered as a dnd-kit
 * drop target via `encodeDropZoneId` so templates can be dragged into a
 * folder; LIVE folders render the dashed "blocked drop" affordance and
 * tooltip from `CollectionChip`. Desktop only — the parent owns the
 * `DndContext`; this component must not create one.
 */
export function PublishHero({
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

  // Alphabetical by title — sidebar rows always read in the same order.
  const sortedCollections = useMemo(
    () =>
      [...collections].sort((a, b) =>
        a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
      ),
    [collections]
  )

  // Case-insensitive title match. The All Templates row is rendered outside
  // the filtered loop so the search box can never hide the top-level filter.
  const visibleCollections = useMemo(() => {
    const needle = search.trim().toLowerCase()
    if (needle === '') return sortedCollections
    return sortedCollections.filter((collection) =>
      collection.title.toLowerCase().includes(needle)
    )
  }, [sortedCollections, search])

  // Count of draft collections that have at least one template — surfaced on
  // the All Templates hero as a "ready to publish" nudge.
  const readyToPublishCount = useMemo(
    () =>
      collections.filter(
        (collection) =>
          collection.status === TemplateGalleryPageStatus.draft &&
          collection.templates.length > 0
      ).length,
    [collections]
  )

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
      data-testid="PublishHero"
      direction="row"
      spacing={0}
      sx={{
        minHeight: 480,
        alignItems: 'stretch',
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'background.paper'
      }}
    >
      {/* LEFT — minimal folder sidebar (~200px). Quiet by design: no
          thumbnails, no status labels, no bold colors. Navigation only. */}
      <Stack
        data-testid="PublishHeroSidebar"
        sx={{
          width: 200,
          flexShrink: 0,
          borderRight: 1,
          borderColor: 'divider',
          position: 'sticky',
          top: 0,
          alignSelf: 'flex-start',
          maxHeight: '100vh'
        }}
      >
        <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
          <Typography
            variant="h6"
            sx={{
              color: 'text.primary',
              lineHeight: 1.2,
              fontWeight: 700
            }}
          >
            {t('Collections')}
          </Typography>
        </Box>

        {/* Search — small, no surrounding chrome box, sized to feel
            secondary to the hero CTA on the right. */}
        <Box sx={{ px: 2, pb: 1 }}>
          <TextField
            value={search}
            onChange={handleSearchChange}
            placeholder={t('Search collections')}
            size="small"
            fullWidth
            variant="standard"
            inputProps={{ 'aria-label': t('Search collections') }}
            InputProps={{
              disableUnderline: false,
              startAdornment: (
                <InputAdornment position="start">
                  <Search1Icon
                    fontSize="small"
                    sx={{ color: 'text.secondary' }}
                  />
                </InputAdornment>
              )
            }}
          />
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
          {/* "Drop a template here to create a new collection seeded with
              it." Sits above All Templates so the quick-create path is the
              first thing the user encounters while dragging. The dashed
              border is the universal drop-zone signal; idle state stays
              muted so it doesn't compete with the hero CTA on the right. */}
          <CreateCollectionDropZone disabled={dropDisabled} />
          <SidebarRow
            testId="PublishHeroRow-all"
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
              testId={`PublishHeroRow-${collection.id}`}
              title={collection.title}
              count={collection.templates.length}
              selected={selectedCollectionId === collection.id}
              onSelect={() => onSelectCollection(collection.id)}
              dropZone={{ kind: 'collection', id: collection.id }}
              dropDisabled={dropDisabled}
              isPublishedDropTarget={
                collection.status === TemplateGalleryPageStatus.published
              }
            />
          ))}
        </Box>
      </Stack>

      {/* RIGHT — hero + templates. */}
      <Stack sx={{ flex: 1, minWidth: 0, p: 3 }} spacing={3}>
        <PublishHeroCard
          selectedCollection={selectedCollection}
          allTemplatesCount={allTemplatesCount}
          readyToPublishCount={readyToPublishCount}
          busy={selectedCollection != null && busyId === selectedCollection.id}
          canPublish={canPublish}
          publishBlockedReason={publishBlockedReason}
          onEdit={onEdit}
          onOpenPublish={onOpenPublish}
          onUngroup={onUngroup}
        />

        <Stack spacing={1.5}>
          <Typography
            variant="overline"
            sx={{ color: 'text.secondary', letterSpacing: 0.6 }}
          >
            {t('Templates')}
          </Typography>
          {filteredJourneys.length === 0 ? (
            <EmptyState
              hasSelectedCollection={selectedCollection != null}
              allTemplatesCount={allTemplatesCount}
            />
          ) : (
            <Box
              data-testid="PublishHeroDraggableScope"
              // Drag-affordance layer for the template cards in this scope:
              //   - `cursor: grab` on every card (and `grabbing` while
              //     active) — the universal "you can pick this up" signal.
              //   - On hover, a centered "move" icon (Material Design's
              //     open_with — four arrows pointing out) overlays the image
              //     area on a translucent dark badge so the affordance reads
              //     against any thumbnail. The badge sits at ~25% from the
              //     top of the card, which lands inside the image region of
              //     the standard JourneyCard layout.
              //   - The overlay is `pointerEvents: none` so it never
              //     intercepts clicks or drags.
              // Scoped via `& .MuiCard-root` so only template cards inside
              // this scope are affected — the hero card and sidebar rows
              // stay untouched.
              sx={{
                '& .MuiCard-root': {
                  cursor: 'grab',
                  position: 'relative',
                  '&:active': {
                    cursor: 'grabbing'
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: '25%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0, 0, 0, 0.55)',
                    backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'><path d='M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z'/></svg>")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backgroundSize: '28px 28px',
                    opacity: 0,
                    pointerEvents: 'none',
                    transition: 'opacity 150ms ease',
                    zIndex: 2
                  },
                  '&:hover::after': {
                    opacity: 1
                  }
                }
              }}
            >
              <DraggableJourneysGrid
                journeys={filteredJourneys}
                publishedLock={publishedLock}
                dragInFlight={dragInFlight}
              />
            </Box>
          )}
        </Stack>
      </Stack>
    </Stack>
  )
}

/**
 * Quick-create drop zone. Dropping a template here triggers the
 * `create-new` drop kind in `useDragEndHandler`, which calls the parent's
 * `handleCreateCollectionFromTemplate` — a single `templateGalleryPageCreate`
 * call with `journeyIds: [templateId]` that creates the collection AND
 * seeds it with the dropped template in one server round-trip.
 *
 * Visually muted at idle so it doesn't compete with the hero PUBLISH NOW
 * CTA on the right; the dashed border + primary highlight kick in only
 * while a template is being dragged over it.
 */
function CreateCollectionDropZone({
  disabled
}: {
  disabled: boolean
}): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { setNodeRef, isOver } = useDroppable({
    id: encodeDropZoneId({ kind: 'create-new' }),
    disabled
  })
  // Subscribe to the dnd-kit context so the zone can react as soon as ANY
  // drag begins — not just when the pointer is over the zone. This is what
  // makes the zone "glow" the moment the user picks up a template,
  // signalling the quick-create affordance before they're aiming.
  const { active } = useDndContext()
  const dragActive = active != null

  return (
    <Box
      ref={setNodeRef}
      data-testid="PublishHeroCreateNewDropZone"
      aria-label={t('Drop a template here to create a new collection')}
      sx={{
        mx: 1,
        mb: 1.5,
        py: 2.5,
        px: 1.5,
        borderRadius: 1.5,
        border: '2px dashed',
        // Idle: muted divider. Drag-active: primary border (the "glow"
        // borrows the same color). isOver wins over both.
        borderColor: isOver || dragActive ? 'primary.main' : 'divider',
        backgroundColor: isOver
          ? 'action.selected'
          : dragActive
            ? 'action.hover'
            : 'transparent',
        color: isOver || dragActive ? 'primary.main' : 'text.secondary',
        // Glow on drag-active. The admin theme's primary is #C52D3A, so we
        // use rgba of that hue for the box-shadow halo. Stronger when
        // hovered, softer (pulsing) when drag is active but not over.
        boxShadow: isOver
          ? '0 0 0 4px rgba(197, 45, 58, 0.22), 0 0 24px rgba(197, 45, 58, 0.45)'
          : 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.75,
        transition:
          'border-color 200ms ease, background-color 200ms ease, color 200ms ease, box-shadow 200ms ease',
        animation:
          dragActive && !isOver
            ? 'publishHeroCreateNewPulse 1.6s ease-in-out infinite'
            : 'none',
        '@keyframes publishHeroCreateNewPulse': {
          '0%, 100%': {
            boxShadow:
              '0 0 0 0 rgba(197, 45, 58, 0), 0 0 8px rgba(197, 45, 58, 0.25)'
          },
          '50%': {
            boxShadow:
              '0 0 0 6px rgba(197, 45, 58, 0.12), 0 0 22px rgba(197, 45, 58, 0.45)'
          }
        }
      }}
    >
      <Plus2Icon sx={{ fontSize: 26 }} />
      <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
        {isOver ? t('Drop to create') : t('New collection')}
      </Typography>
    </Box>
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
}

/**
 * Compact (~36px) sidebar row. Title on the left, count on the right —
 * no thumbnails, no labels, no bold colors. Active row gets a subtle
 * background + a thin primary left-border accent. Doubles as a dnd-kit
 * drop target; LIVE folders render the dashed "blocked" affordance.
 */
function SidebarRow({
  testId,
  title,
  count,
  selected,
  onSelect,
  dropZone,
  dropDisabled,
  isPublishedDropTarget
}: SidebarRowProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { setNodeRef, isOver } = useDroppable({
    id: encodeDropZoneId(dropZone),
    disabled: dropDisabled
  })

  const dropBlocked = isOver && isPublishedDropTarget
  const active = isOver && !isPublishedDropTarget

  // Resolve border colors up front to keep the sx literal free of duplicate
  // keys across the three states (idle, drop target, blocked).
  let borderColor: string = 'transparent'
  let borderLeftColor: string = selected ? 'primary.main' : 'transparent'
  if (dropBlocked) {
    borderColor = 'text.disabled'
    borderLeftColor = 'text.disabled'
  } else if (active) {
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
          minHeight: 36,
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          textAlign: 'left',
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
          transition: 'background-color 120ms ease, border-color 120ms ease'
        }}
      >
        <Typography
          variant="body2"
          sx={{
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontWeight: selected ? 600 : 400,
            color: 'text.primary'
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', flexShrink: 0 }}
        >
          {count}
        </Typography>
      </ButtonBase>
    </Tooltip>
  )
}

interface PublishHeroCardProps {
  selectedCollection: TemplateGalleryPage | null
  allTemplatesCount: number
  readyToPublishCount: number
  busy: boolean
  canPublish: boolean
  publishBlockedReason: string | null
  onEdit: (collection: TemplateGalleryPage) => void
  onOpenPublish: (collection: TemplateGalleryPage) => void
  onUngroup: (collection: TemplateGalleryPage) => void
}

/**
 * The visual centerpiece of the variant. Swaps between four states:
 *  - All Templates (no selection): plain explainer + optional "N drafts
 *    ready to publish" callout.
 *  - Selected published collection: success-tinted card with the LIVE label.
 *  - Selected draft with templates: primary-tinted card with the full-width
 *    PUBLISH NOW CTA — the loudest element on the page.
 *  - Selected draft without templates: muted card with helper text; no CTA.
 */
function PublishHeroCard({
  selectedCollection,
  allTemplatesCount,
  readyToPublishCount,
  busy,
  canPublish,
  publishBlockedReason,
  onEdit,
  onOpenPublish,
  onUngroup
}: PublishHeroCardProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  // No selection → All Templates overview.
  if (selectedCollection == null) {
    return (
      <Box
        data-testid="PublishHeroCard-all"
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          p: 3,
          bgcolor: 'background.paper'
        }}
      >
        <Stack spacing={1}>
          <Typography
            variant="overline"
            sx={{ color: 'text.secondary', letterSpacing: 0.6 }}
          >
            {t('All Templates')}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {t('All Templates')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('{{count}} templates across all collections', {
              count: allTemplatesCount,
              defaultValue_one: '{{count}} template across all collections',
              defaultValue_other: '{{count}} templates across all collections'
            })}
          </Typography>
          {readyToPublishCount > 0 && (
            <Alert
              data-testid="PublishHeroReadyToPublishCallout"
              severity="warning"
              variant="outlined"
              icon={false}
              sx={{ mt: 2 }}
            >
              {t(
                '{{count}} collections are ready to publish — pick one from the sidebar to publish',
                {
                  count: readyToPublishCount,
                  defaultValue_one:
                    '{{count}} collection is ready to publish — pick one from the sidebar to publish',
                  defaultValue_other:
                    '{{count}} collections are ready to publish — pick one from the sidebar to publish'
                }
              )}
            </Alert>
          )}
        </Stack>
      </Box>
    )
  }

  const isPublished =
    selectedCollection.status === TemplateGalleryPageStatus.published
  const templateCount = selectedCollection.templates.length
  const isEmptyDraft = !isPublished && templateCount === 0

  // PUBLISHED — success-tinted card, LIVE label, Edit only.
  if (isPublished) {
    return (
      <Box
        data-testid="PublishHeroCard-published"
        sx={{
          border: 1,
          borderTop: 4,
          borderColor: 'divider',
          borderTopColor: 'success.main',
          borderRadius: 2,
          p: 3,
          bgcolor: (theme) => `${theme.palette.success.main}0F`
        }}
      >
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography
              variant="overline"
              sx={{ color: 'success.main', letterSpacing: 0.6 }}
            >
              {t('Published')}
            </Typography>
            <LabelChip color="success" label={t('Live')} />
          </Stack>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {selectedCollection.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('{{count}} templates · Published', {
              count: templateCount,
              defaultValue_one: '{{count}} template · Published',
              defaultValue_other: '{{count}} templates · Published'
            })}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button
              data-testid="PublishHeroEditButton"
              variant="text"
              onClick={() => onEdit(selectedCollection)}
              disabled={busy}
            >
              {t('Edit')}
            </Button>
          </Stack>
        </Stack>
      </Box>
    )
  }

  // EMPTY DRAFT — muted card, helper text, no PUBLISH.
  if (isEmptyDraft) {
    return (
      <Box
        data-testid="PublishHeroCard-empty"
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          p: 3,
          bgcolor: 'grey.50'
        }}
      >
        <Stack spacing={1}>
          <Typography
            variant="overline"
            sx={{ color: 'text.secondary', letterSpacing: 0.6 }}
          >
            {t('Empty Collection')}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {selectedCollection.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t(
              'Add templates to publish. Drag any template card onto a folder.'
            )}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button
              data-testid="PublishHeroEditButton"
              variant="text"
              onClick={() => onEdit(selectedCollection)}
              disabled={busy}
            >
              {t('Edit')}
            </Button>
          </Stack>
        </Stack>
      </Box>
    )
  }

  // READY-TO-PUBLISH DRAFT — primary-tinted card, full-width PUBLISH NOW CTA.
  // The PUBLISH button is intentionally the loudest element on the variant.
  const publishDisabled = !canPublish || busy
  const publishButton = (
    <span>
      <Button
        data-testid="PublishHeroPublishButton"
        variant="contained"
        color="primary"
        size="large"
        fullWidth
        startIcon={<Upload1Icon />}
        disabled={publishDisabled}
        onClick={() => onOpenPublish(selectedCollection)}
        sx={{
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: 0.6,
          py: 1.5
        }}
      >
        {t('Publish Now')}
      </Button>
    </span>
  )

  return (
    <Box
      data-testid="PublishHeroCard-draft"
      sx={{
        border: 1,
        borderTop: 4,
        borderColor: 'divider',
        borderTopColor: 'primary.main',
        borderRadius: 2,
        p: 3,
        bgcolor: (theme) => `${theme.palette.primary.main}0F`
      }}
    >
      <Stack spacing={1}>
        <Typography
          variant="overline"
          sx={{ color: 'primary.main', letterSpacing: 0.6, fontWeight: 700 }}
        >
          {t('Ready to Publish')}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {selectedCollection.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('{{count}} templates · DRAFT', {
            count: templateCount,
            defaultValue_one: '{{count}} template · DRAFT',
            defaultValue_other: '{{count}} templates · DRAFT'
          })}
        </Typography>
        <Box sx={{ mt: 2 }}>
          {publishDisabled && publishBlockedReason != null ? (
            <Tooltip title={publishBlockedReason} arrow placement="top">
              {publishButton}
            </Tooltip>
          ) : (
            publishButton
          )}
        </Box>
        <Stack
          direction="row"
          spacing={1}
          sx={{ mt: 1, justifyContent: 'flex-end' }}
        >
          <Button
            data-testid="PublishHeroEditButton"
            variant="text"
            onClick={() => onEdit(selectedCollection)}
            disabled={busy}
          >
            {t('Edit')}
          </Button>
          <Button
            data-testid="PublishHeroUngroupButton"
            variant="text"
            onClick={() => onUngroup(selectedCollection)}
            disabled={busy}
          >
            {t('Ungroup')}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}

interface EmptyStateProps {
  hasSelectedCollection: boolean
  allTemplatesCount: number
}

/**
 * Centered message shown when the templates grid is empty. Copy varies
 * depending on whether a collection is selected (drop hint) or All
 * Templates is active (team-empty vs all-grouped).
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
      data-testid="PublishHeroEmpty"
      sx={{
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
