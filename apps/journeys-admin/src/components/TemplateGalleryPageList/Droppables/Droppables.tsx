import { Collision, useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import { alpha } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, memo } from 'react'

import LinkIcon from '@core/shared/ui/icons/Link'

import { GetAdminJourneys_journeys as Journey } from '../../../../__generated__/GetAdminJourneys'
import { JourneyCard } from '../../JourneyList/JourneyCard'
import { COLLECTION_GRID_SPACING } from '../collectionLayout'

/** What a drop on one of a collection's reveal boxes means. */
export type DropAction = 'move' | 'link'

/**
 * Where a card lives. Cards carry this in their draggable id (see
 * `encodeCardId`) because one journey can now render in several
 * collections at once, so a bare journey id no longer identifies a card.
 */
export type CardZone =
  | { kind: 'unsectioned' }
  | { kind: 'collection'; id: string }

// Drop zone identity is encoded into a string the dnd-kit `over.id` carries
// back into the dispatcher. Wrappers use the encoder; the parent uses the
// decoder to route the drop.
export type DropZoneId =
  | CardZone
  | { kind: 'action'; collectionId: string; action: DropAction }

const UNSECTIONED_ID = 'unsectioned'
const COLLECTION_PREFIX = 'collection:'
const ACTION_PREFIX = 'action:'
const CARD_SEPARATOR = '|'

export function encodeDropZoneId(zone: DropZoneId): string {
  switch (zone.kind) {
    case 'unsectioned':
      return UNSECTIONED_ID
    case 'collection':
      return `${COLLECTION_PREFIX}${zone.id}`
    case 'action':
      return `${ACTION_PREFIX}${zone.action}:${zone.collectionId}`
  }
}

export function parseDropZoneId(raw: string): DropZoneId | null {
  // Card ids embed a zone id before the separator; they are not zones.
  if (raw.includes(CARD_SEPARATOR)) return null
  if (raw === UNSECTIONED_ID) return { kind: 'unsectioned' }
  if (raw.startsWith(COLLECTION_PREFIX)) {
    return { kind: 'collection', id: raw.slice(COLLECTION_PREFIX.length) }
  }
  if (raw.startsWith(ACTION_PREFIX)) {
    const rest = raw.slice(ACTION_PREFIX.length)
    const separator = rest.indexOf(':')
    if (separator < 0) return null
    const action = rest.slice(0, separator)
    if (action !== 'move' && action !== 'link') return null
    return { kind: 'action', action, collectionId: rest.slice(separator + 1) }
  }
  return null
}

export interface CardId {
  zone: CardZone
  journeyId: string
}

/**
 * Draggable / sortable id for a card: its zone plus the journey id, so the
 * same journey rendered in two collections registers as two distinct
 * draggables. Ids never contain the separator (uuids), so the last one
 * splits zone from journey.
 */
export function encodeCardId({ zone, journeyId }: CardId): string {
  return `${encodeDropZoneId(zone)}${CARD_SEPARATOR}${journeyId}`
}

export function parseCardId(raw: string): CardId | null {
  const separator = raw.lastIndexOf(CARD_SEPARATOR)
  if (separator < 0) return null
  const zone = parseDropZoneId(raw.slice(0, separator))
  if (zone == null || zone.kind === 'action') return null
  const journeyId = raw.slice(separator + 1)
  if (journeyId === '') return null
  return { zone, journeyId }
}

/**
 * The drop intent for a pointer position, decoded from what is under the
 * cursor and the dragged card's origin:
 *  - `action`   — the cursor is over one of a collection's Move / Link
 *    boxes; that box is the drop target.
 *  - `reorder`  — the dragged card already belongs to the collection under
 *    the cursor; the caller should target the nearest card *within that
 *    collection* so the drop lands at a slot (works even when the cursor is
 *    in the gap between cards, where `pointerWithin` only sees the
 *    container).
 *  - `section`  — moving into a different section (or the unsectioned pool);
 *    the whole section is the drop zone, so target its container.
 *  - `passthrough` — the cursor isn't over any section container; the caller
 *    keeps the raw collision result.
 */
export type SectionDropResolution =
  | { kind: 'action'; collision: Collision }
  | { kind: 'reorder'; collectionId: string }
  | { kind: 'section'; collision: Collision }
  | { kind: 'passthrough' }

/**
 * Decides, from the pointer collisions, how to target the gallery's nested
 * droppables so a whole collection acts as one drop zone without breaking
 * intra-collection reorder. Pure and dnd-kit-geometry-free so it's unit
 * testable; the caller runs the real collision strategies and applies the
 * decision (notably a collection-scoped `closestCenter` for `reorder`).
 *
 * Only pointer-derived collisions should be passed in. A drop in dead space
 * (cursor outside every droppable) must NOT be promoted to a section — that
 * would silently reassign membership on a missed drop — so the caller handles
 * the empty case before calling this.
 */
export function resolveSectionDrop(
  pointerCollisions: Collision[],
  activeCard: CardId | null
): SectionDropResolution {
  // A reveal box wins over the section it floats on.
  const actionCollision = pointerCollisions.find(
    (collision) => parseDropZoneId(String(collision.id))?.kind === 'action'
  )
  if (actionCollision != null) {
    return { kind: 'action', collision: actionCollision }
  }

  // The section container under the cursor (collection or unsectioned). Cards
  // carry composite ids, which parse to null.
  const sectionCollision = pointerCollisions.find((collision) => {
    const zone = parseDropZoneId(String(collision.id))
    return zone != null && zone.kind !== 'action'
  })
  if (sectionCollision == null) return { kind: 'passthrough' }

  const zone = parseDropZoneId(String(sectionCollision.id))
  const sectionCollectionId = zone?.kind === 'collection' ? zone.id : null
  const sourceCollectionId =
    activeCard?.zone.kind === 'collection' ? activeCard.zone.id : null

  // Dragging a card around its own collection → reorder within it.
  if (
    sectionCollectionId != null &&
    sectionCollectionId === sourceCollectionId
  ) {
    return { kind: 'reorder', collectionId: sectionCollectionId }
  }

  return { kind: 'section', collision: sectionCollision }
}

interface DroppableCollectionWrapperProps {
  id: string
  disabled: boolean
  children: ReactElement | ReactElement[]
}

function DroppableCollectionWrapperImpl({
  id,
  disabled,
  children
}: DroppableCollectionWrapperProps): ReactElement {
  const { setNodeRef } = useDroppable({
    id: encodeDropZoneId({ kind: 'collection', id }),
    disabled
  })
  // No hover outline: the reveal boxes (CollectionDropReveal) are the
  // visible drop affordance; the wrapper only exists so a drop between the
  // boxes still resolves to this collection (and is refused with a hint).
  return <Box ref={setNodeRef}>{children}</Box>
}

export const DroppableCollectionWrapper = memo(DroppableCollectionWrapperImpl)

/**
 * How a card relates to the collection it is drawn in. `home` is the
 * template's one crisp card; `link` cards draw greyed. `otherCount` is how
 * many other collections also hold the template, for the home card's chip.
 */
export interface CardMembership {
  role: 'home' | 'link'
  /** Title of the home collection — only meaningful on a link. */
  homeCollectionTitle: string | null
  otherCount: number
}

interface DraggableJourneysGridProps {
  journeys: readonly Journey[]
  dragInFlight: boolean
  /** The section these cards render in; becomes part of each card's id. */
  zone: CardZone
  /** Per-journey role inside a collection. Omitted for the All Templates pool. */
  membershipByJourneyId?: ReadonlyMap<string, CardMembership>
}

// One card slot — kept identical across every grid so cards column-align
// between collections and the All Templates pool (NES-1696).
const GRID_TILE_SIZE = { xs: 12, sm: 6, md: 6, lg: 3, xl: 3 }

function DraggableJourneysGridImpl({
  journeys,
  dragInFlight,
  zone,
  membershipByJourneyId
}: DraggableJourneysGridProps): ReactElement | null {
  if (journeys.length === 0) return null
  // SortableContext gives intra-collection ordering: each item is both a
  // draggable AND a drop target with a known index, so dnd-kit hands us
  // the over-item id in handleDragEnd.
  const ids = journeys.map((journey) =>
    encodeCardId({ zone, journeyId: journey.id })
  )
  // No outer padding: the grid sits directly in its container so the
  // in-collection grid and the All Templates grid share identical
  // geometry and their cards column-align (NES-1696). The card gap is
  // matched to the CollectionCard's inner padding via collectionLayout.
  return (
    <SortableContext items={ids} strategy={rectSortingStrategy}>
      <Grid container spacing={COLLECTION_GRID_SPACING}>
        {journeys.map((journey) => (
          <Grid key={journey.id} size={GRID_TILE_SIZE}>
            <DraggableJourney
              journey={journey}
              zone={zone}
              disabled={dragInFlight}
              membership={membershipByJourneyId?.get(journey.id)}
            />
          </Grid>
        ))}
      </Grid>
    </SortableContext>
  )
}

export const DraggableJourneysGrid = memo(DraggableJourneysGridImpl)

interface UnsectionedDroppableProps {
  disabled: boolean
  children: ReactElement | ReactElement[]
}

// Drop target for the unsectioned pool — drops here remove the template
// from the collection it was picked up from.
export function UnsectionedDroppable({
  disabled,
  children
}: UnsectionedDroppableProps): ReactElement {
  const { setNodeRef, isOver } = useDroppable({
    id: encodeDropZoneId({ kind: 'unsectioned' }),
    disabled
  })
  return (
    <Box
      ref={setNodeRef}
      sx={{
        minHeight: 100,
        // NES-1703: fill the gallery column's remaining height so the
        // unsectioned pool's drop target reaches the bottom of the page —
        // dropping "out of a collection" doesn't demand pixel accuracy on
        // the grid itself.
        flexGrow: 1,
        backgroundColor: (theme) => theme.palette.background.default,
        borderRadius: 1,
        outline: isOver ? '2px solid' : 'none',
        outlineColor: 'primary.main'
      }}
    >
      {children}
    </Box>
  )
}

interface DraggableJourneyProps {
  journey: Journey
  zone: CardZone
  disabled?: boolean
  membership?: CardMembership
}

export function DraggableJourney({
  journey,
  zone,
  disabled,
  membership
}: DraggableJourneyProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  // useSortable plays the role useDraggable did before AND registers this
  // node as a drop target with its index inside the SortableContext, so
  // dnd-kit can hand us the over-item id in handleDragEnd.
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useSortable({
      id: encodeCardId({ zone, journeyId: journey.id }),
      disabled
    })
  const style =
    transform != null
      ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
      : undefined
  const isLink = membership?.role === 'link'
  const chipLabel =
    membership == null
      ? null
      : isLink
        ? membership.homeCollectionTitle != null
          ? t('Linked from {{collection}}', {
              collection: membership.homeCollectionTitle
            })
          : t('Linked')
        : membership.otherCount > 0
          ? t('Also in {{count}} more', { count: membership.otherCount })
          : null
  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      data-testid={`DraggableJourney-${journey.id}`}
      data-membership-role={membership?.role}
      sx={{
        position: 'relative',
        opacity: isDragging ? 0.4 : 1,
        touchAction: 'manipulation',
        cursor: disabled === true ? 'default' : isDragging ? 'grabbing' : 'grab'
      }}
    >
      <JourneyCard
        journey={journey}
        showDragAffordance={disabled === true ? undefined : 'hover'}
        imageFooterBadge={
          chipLabel != null ? (
            <Chip
              size="small"
              icon={<LinkIcon />}
              label={chipLabel}
              data-testid={`MembershipChip-${journey.id}`}
              sx={{
                backgroundColor: 'background.paper',
                color: isLink ? 'text.secondary' : 'text.primary',
                boxShadow: 1,
                maxWidth: '100%'
              }}
            />
          ) : undefined
        }
      />
      {/* A link is the same template as its home, drawn quieter: a light
          veil over the whole card. pointer-events: none keeps the card's
          menu and drag handle live underneath. */}
      {isLink && (
        <Box
          aria-hidden
          data-testid={`LinkedCardVeil-${journey.id}`}
          sx={{
            position: 'absolute',
            inset: 0,
            borderRadius: 3,
            pointerEvents: 'none',
            backgroundColor: (theme) =>
              alpha(theme.palette.background.default, 0.72)
          }}
        />
      )}
    </Box>
  )
}

interface RevealZoneProps {
  collectionId: string
  action: DropAction
  disabled: boolean
  label: string
  hint: string | null
}

function RevealZone({
  collectionId,
  action,
  disabled,
  label,
  hint
}: RevealZoneProps): ReactElement {
  const { setNodeRef, isOver } = useDroppable({
    id: encodeDropZoneId({ kind: 'action', collectionId, action }),
    disabled
  })
  const hot = isOver && !disabled
  return (
    <Box
      ref={setNodeRef}
      data-testid={`CollectionDropZone-${action}-${collectionId}`}
      data-hot={hot ? 'true' : undefined}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 0.25,
        px: 2,
        borderRadius: 3,
        border: '2px dashed',
        borderColor: disabled
          ? 'divider'
          : hot
            ? action === 'move'
              ? 'primary.main'
              : 'text.primary'
            : 'text.secondary',
        borderStyle: hot ? 'solid' : 'dashed',
        color: disabled ? 'text.disabled' : 'text.primary',
        backgroundColor: (theme) =>
          hot
            ? action === 'move'
              ? alpha(theme.palette.primary.main, 0.08)
              : theme.palette.background.default
            : theme.palette.background.paper,
        transition: 'border-color 0.1s ease, background-color 0.1s ease'
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        {label}
      </Typography>
      {hint != null && (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {hint}
        </Typography>
      )}
    </Box>
  )
}

export interface CollectionDropRevealProps {
  collectionId: string
  /** The card being dragged, or null when no drag is in progress. */
  activeCard: CardId | null
  /** True when the dragged template is already in this collection. */
  isMember: boolean
  /** Title of the collection the card was picked up from, if any. */
  sourceCollectionTitle: string | null
  /**
   * `overlay` floats over the collection's card grid (the normal case);
   * `row` renders in flow as a slim strip, for collapsed collections whose
   * grid is unmounted and would otherwise offer nowhere to drop.
   */
  variant: 'overlay' | 'row'
  disabled: boolean
}

/**
 * The Move here / Link here boxes that appear over every eligible
 * collection the moment a drag starts. Renders nothing when no drag is
 * active or when the card came from this very collection (a drag inside
 * its own collection is a reorder). From the All Templates pool a single
 * "Add here" box shows; when the template is already here a single dimmed
 * "Already here" box shows and accepts nothing.
 */
export function CollectionDropReveal({
  collectionId,
  activeCard,
  isMember,
  sourceCollectionTitle,
  variant,
  disabled
}: CollectionDropRevealProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  if (activeCard == null) return null
  if (
    activeCard.zone.kind === 'collection' &&
    activeCard.zone.id === collectionId
  ) {
    return null
  }
  const fromPool = activeCard.zone.kind === 'unsectioned'
  const single = isMember || fromPool

  return (
    <Box
      data-testid={`CollectionDropReveal-${collectionId}`}
      sx={{
        // Above everything a JourneyCard stacks internally (its menu button,
        // badges and footer sit at zIndex 1–3), so the boxes cover the cards
        // completely while a drag is in progress.
        ...(variant === 'overlay'
          ? { position: 'absolute', inset: 0, zIndex: 20 }
          : { position: 'relative', minHeight: 72, mt: 1 }),
        display: 'grid',
        gridTemplateColumns: single ? '1fr' : '1fr 1fr',
        gap: COLLECTION_GRID_SPACING,
        borderRadius: 3,
        backgroundColor: (theme) => alpha(theme.palette.background.default, 0.9)
      }}
    >
      {isMember ? (
        <RevealZone
          collectionId={collectionId}
          action="link"
          disabled
          label={t('Already here')}
          hint={t('Drop to do nothing')}
        />
      ) : fromPool ? (
        <RevealZone
          collectionId={collectionId}
          action="link"
          disabled={disabled}
          label={t('Add here')}
          hint={t('Becomes its home')}
        />
      ) : (
        <>
          <RevealZone
            collectionId={collectionId}
            action="move"
            disabled={disabled}
            label={t('Move here')}
            hint={
              sourceCollectionTitle != null
                ? t('Leaves {{collection}}', {
                    collection: sourceCollectionTitle
                  })
                : null
            }
          />
          <RevealZone
            collectionId={collectionId}
            action="link"
            disabled={disabled}
            label={t('Link here')}
            hint={t('Keeps it where it is')}
          />
        </>
      )}
    </Box>
  )
}
