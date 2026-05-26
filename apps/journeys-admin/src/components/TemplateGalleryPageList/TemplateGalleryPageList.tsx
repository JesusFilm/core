import {
  CollisionDetection,
  DndContext,
  DragOverlay,
  DragStartEvent,
  MeasuringStrategy,
  Modifier,
  MouseSensor,
  TouchSensor,
  closestCenter,
  pointerWithin,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

import { useTeam } from '@core/journeys/ui/TeamProvider'
import Plus2Icon from '@core/shared/ui/icons/Plus2'

import {
  GetAdminJourneysVariables,
  GetAdminJourneys_journeys as Journey
} from '../../../__generated__/GetAdminJourneys'
import { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../__generated__/GetTemplateGalleryPages'
import {
  JourneyStatus,
  TemplateGalleryPageStatus
} from '../../../__generated__/globalTypes'
import { useAdminJourneysQuery } from '../../libs/useAdminJourneysQuery'
import { useCanPublishCollection } from '../../libs/useCanPublishCollection'
import { useTemplateGalleryPageCreateMutation } from '../../libs/useTemplateGalleryPageCreateMutation'
import { useTemplateGalleryPagesQuery } from '../../libs/useTemplateGalleryPagesQuery'
import { JourneyCard } from '../JourneyList/JourneyCard'
import type { JourneyStatusFilter } from '../JourneyList/JourneyListView'

import { CollectionCard } from './CollectionCard'
import { CollectionDialog } from './CollectionDialog'
import {
  COLLECTION_CARD_BORDER_WIDTH,
  COLLECTION_CARD_PADDING
} from './collectionLayout'
import { CollectionPublishSuccessDialog } from './CollectionPublishSuccessDialog'
import {
  DraggableJourneysGrid,
  DroppableCollectionWrapper,
  UnsectionedDroppable
} from './Droppables'
import {
  GalleryDialogLockContext,
  GalleryDialogLockContextValue
} from './GalleryDialogLockContext'
import { MobileCollectionRow } from './MobileCollectionRow'
import { MobileFilterHeaderStrip } from './MobileFilterHeaderStrip'
import { MobileTemplateList } from './MobileTemplateList'
import { useCollectionMutations } from './useCollectionMutations'
import { useDragEndHandler } from './useDragEndHandler'

// Pointer-only collision detection for the mobile layout.
//
// The mobile draggable is a full-width list row, but its drop targets include
// the small collection chips pinned at the top of the view. dnd-kit's default
// `closestCenter` compares the *dragged row's* centre against each droppable's
// centre and never looks at the pointer — so a row dragged by its right-edge
// handle can't reach a chip, and the nearest droppable (the leftmost "All
// Templates" chip) lights up the instant a drag starts, even when the finger
// is nowhere near it (NES-1696 QA).
//
// `pointerWithin` resolves only the droppable the finger is actually over, and
// returns nothing when the finger is in dead space — so no chip highlights
// until the user is genuinely over a drop target. There is deliberately no
// `closestCenter` fallback: that fallback is exactly what made "All Templates"
// highlight on every drag. (Safe here because the only sensors are
// mouse/touch, which always report pointer coordinates — there is no keyboard
// drag that would need a coordinate-free fallback.)
const mobileCollisionDetection: CollisionDetection = (args) =>
  pointerWithin(args)

// Center the mobile drag overlay under the pointer.
//
// The mobile drag handle sits on the far right of the row, so by default the
// ghost trails to the LEFT of the finger: the cursor is at the row's right
// edge while the visible body extends left. Users aim the body they can see,
// but `pointerWithin` drops at the actual cursor — so left chips needed the
// cursor pushed off-screen right and the rightmost chips were unreachable
// (NES-1696 QA: "only the first two are droppable"). Re-centering the ghost on
// the pointer makes "aim the ghost" == "aim the cursor", so every chip is
// reachable and the drop lands where the user is pointing.
const snapCenterToPointer: Modifier = ({
  activatorEvent,
  draggingNodeRect,
  transform
}) => {
  if (draggingNodeRect == null || activatorEvent == null) return transform
  // activatorEvent is the mouse/touch event that started the drag.
  const event = activatorEvent as Partial<MouseEvent> & {
    touches?: TouchList
  }
  const clientX = event.touches?.[0]?.clientX ?? event.clientX
  const clientY = event.touches?.[0]?.clientY ?? event.clientY
  if (clientX == null || clientY == null) return transform
  const offsetX = clientX - draggingNodeRect.left
  const offsetY = clientY - draggingNodeRect.top
  return {
    ...transform,
    x: transform.x + offsetX - draggingNodeRect.width / 2,
    y: transform.y + offsetY - draggingNodeRect.height / 2
  }
}

// Map the page-level status filter (active / archived / trashed) to the
// underlying JourneyStatus enum values that useAdminJourneysQuery expects.
// Mirrors ActiveJourneyList / ArchivedJourneyList / TrashedJourneyList.
const STATUS_FILTER_TO_JOURNEY_STATUSES: Record<
  JourneyStatusFilter,
  JourneyStatus[]
> = {
  active: [JourneyStatus.draft, JourneyStatus.published],
  archived: [JourneyStatus.archived],
  trashed: [JourneyStatus.trashed]
}

// Build the shareable public URL for a published collection. Mirrors the
// pattern in JourneyQuickSettings: respect NEXT_PUBLIC_JOURNEYS_URL,
// fall back to your.nextstep.is. The path is `/template-gallery/<slug>`
// per the NES-1539 spec.
function buildCollectionPublicUrl(slug: string): string {
  const base =
    process.env.NEXT_PUBLIC_JOURNEYS_URL ?? 'https://your.nextstep.is'
  return `${base}/template-gallery/${slug}`
}

export interface TemplateGalleryPageListProps {
  /**
   * True when this panel is the active tab. Used to refetch on tab
   * re-visit — the shared TabPanel keeps this component mounted once
   * visible, so cache-and-network alone won't refire the network on
   * subsequent visits. The parent passes the boolean so this component
   * doesn't have to read router state.
   */
  visible?: boolean
  /**
   * Page-level status filter (active / archived / trashed). Defaults to
   * 'active'. The unsectioned templates list only surfaces journeys
   * matching this filter, mirroring ActiveJourneyList / ArchivedJourneyList /
   * TrashedJourneyList. Collections are an active-state concept and are
   * hidden when status !== 'active'.
   */
  status?: JourneyStatusFilter
  /**
   * Opens the Template Info side panel's mobile drawer. When provided, an
   * inline info IconButton renders next to the Collections heading on xs/sm
   * viewports (NES-1686 — replaces the prior floating top-right button).
   * Undefined when the info panel feature is gated off, suppressing the
   * trigger.
   */
  onOpenInfo?: () => void
}

export function TemplateGalleryPageList({
  visible = true,
  status = 'active',
  onOpenInfo
}: TemplateGalleryPageListProps = {}): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { activeTeam } = useTeam()
  const { enqueueSnackbar } = useSnackbar()
  const teamId = activeTeam?.id

  // Mobile = xs + sm (< md, < 900px). The Active tab gets a denser
  // chip-row + list layout; archived/trashed already hide collections
  // and so look the same on both layouts.
  const isMobileLayout = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('md')
  )

  // Collections + DnD are only meaningful in the active view. In archived
  // or trashed views the user is curating those buckets, not assigning to
  // public gallery pages.
  const showCollections = status === 'active'
  const useMobileLayout = isMobileLayout && showCollections

  // Custom-domain teams can't publish gallery pages — gate Publish + Preview
  // on every Collection surface (NES-1644).
  const { canPublish, reason: publishBlockedReason } = useCanPublishCollection({
    teamId
  })

  const collectionsQuery = useTemplateGalleryPagesQuery(
    teamId != null ? { teamId } : undefined,
    { skip: teamId == null || !showCollections }
  )
  // cache-and-network: the "Make Template" mutation only writes an id-only
  // ref into adminJourneys, so a pure cache hit on re-mount would omit the
  // new template's display fields.
  const journeysQuery = useAdminJourneysQuery(
    {
      template: true,
      teamId,
      status: STATUS_FILTER_TO_JOURNEY_STATUSES[status]
    } satisfies GetAdminJourneysVariables,
    { fetchPolicy: 'cache-and-network' }
  )

  // TabPanel keeps this component mounted once revealed, so cache-and-network
  // alone won't refire the network on re-visit; refetch when `visible` flips
  // back on. Skip the initial mount — cache-and-network on `journeysQuery`
  // is already fetching, and `collectionsQuery` runs on first mount too.
  // Without this guard, every team-switch and tab-activation issued a
  // duplicate initial fetch.
  //
  // Strict Mode safety: the dev double-invocation unmounts then remounts the
  // component, which creates a fresh ref (initial value true) on the second
  // mount. The "skip initial mount" branch fires on both, so neither pass
  // dispatches a refetch — only a later visible/teamId change does.
  const initialMountRef = useRef(true)
  useEffect(() => {
    if (!visible || teamId == null) return
    if (initialMountRef.current) {
      initialMountRef.current = false
      return
    }
    void journeysQuery.refetch()
    void collectionsQuery.refetch()
    // refetch fns are stable proxies — depending on the visibility signal
    // and teamId is the right semantic, not the refetch identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, teamId])

  // Mounted guard for `handlePublish`: rawPublish awaits the mutation and
  // we then setPublishSuccessCollection. If the user navigates away mid-
  // flight, the post-await setState would warn (and would briefly flash
  // the dialog open on the next page if React batches the update across
  // a route change). Mirrors the same pattern in useCollectionMutations.
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const { busyId, ungroup: handleUngroup } = useCollectionMutations()

  const [templateGalleryPageCreate, { loading: createLoading }] =
    useTemplateGalleryPageCreateMutation()
  // Synchronous double-click guard for the instant-create flow. The
  // button's `disabled={createLoading}` reflects Apollo's loading state,
  // but that flips asynchronously — two clicks in the same tick both
  // pass the React-state guard and fire two mutations (auto-name then
  // hands out "Collection 1" + "Collection 2" for a single intent).
  // A ref mutation is visible to the next synchronous read, so the
  // second click sees `true` and returns immediately. Same pattern as
  // `submittingRef` in useCollectionForm and `dragInFlightRef` above.
  const creatingRef = useRef(false)
  const [editTargetId, setEditTargetId] = useState<string | null>(null)
  const [publishTargetId, setPublishTargetId] = useState<string | null>(null)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  // Mobile-only filter state. `null` means "All Templates" is active and
  // the list shows unsectioned templates. A collection id filters the
  // list to that collection's templates. Ignored on desktop where the
  // full grid renders every section at once.
  const [mobileFilterCollectionId, setMobileFilterCollectionId] = useState<
    string | null
  >(null)
  // `dragInFlight` drives rendering (busy chips, droppable lock); the ref
  // is the synchronous source of truth for gating a second drop that
  // arrives within the same tick as a setState batch — state would read
  // `false` in both event handlers, the ref flips immediately.
  //
  // The two are deliberately wired together via a single `setDragInFlight`
  // wrapper so a future caller can't update one without the other
  // (Mike review, NES-1644). Always flip both through this setter.
  const [dragInFlight, setDragInFlightState] = useState(false)
  const dragInFlightRef = useRef(false)
  const setDragInFlight = useCallback((next: boolean) => {
    dragInFlightRef.current = next
    setDragInFlightState(next)
  }, [])
  // Holds the just-published collection so the success dialog has a stable
  // reference to it (the gallery list cache may change underneath while the
  // user is still looking at the dialog).
  const [publishSuccessCollection, setPublishSuccessCollection] =
    useState<TemplateGalleryPage | null>(null)

  // NES-1666 v2: track per-card dialogs (Edit Template Details, access,
  // restore, delete, trash, translate, breakdown analytics) so the
  // top-level `dialogOpen` boolean also flips when any of them are open.
  // v1 only handled CollectionDialog; Sharon's repro showed the per-card
  // template-details dialog still let drags through.
  const [openDialogCardIds, setOpenDialogCardIds] = useState<
    ReadonlySet<string>
  >(() => new Set())
  const handleCardDialogOpenChange = useCallback(
    (cardId: string, open: boolean): void => {
      setOpenDialogCardIds((prev) => {
        if (open === prev.has(cardId)) return prev
        const next = new Set(prev)
        if (open) next.add(cardId)
        else next.delete(cardId)
        return next
      })
    },
    []
  )
  const galleryDialogLockValue = useMemo<GalleryDialogLockContextValue>(
    () => ({ onDialogOpenChange: handleCardDialogOpenChange }),
    [handleCardDialogOpenChange]
  )

  // True when any modal is open. While modal is open, page-level draggables
  // and droppables are disabled and any in-flight drag state is cleared
  // (NES-1653): cursor moves inside the dialog were continuing to drive
  // dnd-kit's SortableContext, rearranging the cards visible behind the
  // dialog because the DragOverlay (z-index 999) tracks cursor position
  // beneath the dialog (z-index 1300) even while hidden.
  const dialogOpen =
    editTargetId != null ||
    publishTargetId != null ||
    publishSuccessCollection != null ||
    openDialogCardIds.size > 0
  const interactionsLocked = dragInFlight || dialogOpen

  useEffect(() => {
    if (dialogOpen) {
      setActiveDragId(null)
    }
  }, [dialogOpen])

  function handlePublished(collection: TemplateGalleryPage): void {
    if (!mountedRef.current) return
    setPublishSuccessCollection(collection)
  }
  function handleClosePublishSuccess(): void {
    setPublishSuccessCollection(null)
  }

  const collections = useMemo<readonly TemplateGalleryPage[]>(
    () => collectionsQuery.data?.templateGalleryPages ?? [],
    [collectionsQuery.data]
  )
  // Filter the cached journeys list to the statuses this view allows.
  // The server-side query is already keyed on `status:
  // STATUS_FILTER_TO_JOURNEY_STATUSES[status]`, but Apollo's normalized
  // cache stores each Journey as a normalized entity — when a mutation
  // flips an in-list journey's status (archive, trash, delete), the
  // cached list still holds the ref, so the journey leaks into the
  // wrong view until a refetch. Apply the same status predicate the
  // server applies so the client view stays consistent with the
  // entity's current status across optimistic updates.
  const allTemplates = useMemo<readonly Journey[]>(() => {
    const allowedStatuses = STATUS_FILTER_TO_JOURNEY_STATUSES[status]
    return (journeysQuery.data?.journeys ?? []).filter((j) =>
      allowedStatuses.includes(j.status)
    )
  }, [journeysQuery.data, status])

  // Collections only surface once the team has at least one active
  // (draft/published) template to group (NES-1696). The status filter
  // already excludes archived/trashed; templates inside existing
  // collections still count because `allTemplates` is the team's full
  // template set, not just the unsectioned pool.
  const showCollectionsSection = showCollections && allTemplates.length > 0

  const journeyById = useMemo(() => {
    const map = new Map<string, Journey>()
    for (const journey of allTemplates) map.set(journey.id, journey)
    return map
  }, [allTemplates])

  const templateIdToCollection = useMemo(() => {
    const map = new Map<string, TemplateGalleryPage>()
    for (const collection of collections) {
      for (const template of collection.templates) {
        map.set(template.id, collection)
      }
    }
    return map
  }, [collections])

  // Each collection's templates resolved to full Journey objects, in
  // display order. Memoized so the per-collection map+filter doesn't
  // run inline in the render — it would otherwise recompute on every
  // re-render (drag start/end, mutation completion, etc.) and hand a
  // fresh array reference to every card, defeating React.memo.
  const journeysByCollection = useMemo(() => {
    const map = new Map<string, readonly Journey[]>()
    for (const collection of collections) {
      map.set(
        collection.id,
        collection.templates
          .map((tpl) => journeyById.get(tpl.id))
          .filter((j): j is Journey => j != null)
      )
    }
    return map
  }, [collections, journeyById])

  const collectionsById = useMemo(() => {
    const map = new Map<string, TemplateGalleryPage>()
    for (const collection of collections) map.set(collection.id, collection)
    return map
  }, [collections])

  const unsectioned = useMemo<readonly Journey[]>(
    () =>
      allTemplates.filter((journey) => !templateIdToCollection.has(journey.id)),
    [allTemplates, templateIdToCollection]
  )

  const editTarget =
    editTargetId != null ? (collectionsById.get(editTargetId) ?? null) : null
  const publishTarget =
    publishTargetId != null
      ? (collectionsById.get(publishTargetId) ?? null)
      : null

  // Mobile-only: resolve the filter id into the collection (or null for
  // "All Templates") and the list of templates the row component renders.
  // When the filter points at a collection that has since been removed
  // (e.g. user ungroupped it from another tab), fall back to "All
  // Templates" so the strip header doesn't render with a stale title.
  const mobileSelectedCollection =
    mobileFilterCollectionId != null
      ? (collectionsById.get(mobileFilterCollectionId) ?? null)
      : null
  const mobileFilteredJourneys = useMemo<readonly Journey[]>(() => {
    if (mobileSelectedCollection == null) return unsectioned
    return journeysByCollection.get(mobileSelectedCollection.id) ?? []
  }, [mobileSelectedCollection, journeysByCollection, unsectioned])

  // Pool the dialog's template picker draws from. Only ungrouped templates
  // are addable, plus the templates already in the collection being
  // edited / published so the user can deselect them. Hides templates
  // owned by other collections to prevent accidental dual-membership.
  function buildAvailableJourneys(
    target: TemplateGalleryPage | null
  ): readonly Journey[] {
    if (target == null) return unsectioned
    const seen = new Set(unsectioned.map((j) => j.id))
    // Resolve each template through journeyById so the picker always sees
    // the full Journey shape (the gallery fragment only carries id/title
    // and would not satisfy Journey on its own).
    const own = target.templates
      .filter((tpl) => !seen.has(tpl.id))
      .map((tpl) => journeyById.get(tpl.id))
      .filter((j): j is Journey => j != null)
    return [...unsectioned, ...own]
  }
  const editAvailableJourneys = useMemo<readonly Journey[]>(
    () => buildAvailableJourneys(editTarget),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unsectioned, editTarget, journeyById]
  )
  const publishAvailableJourneys = useMemo<readonly Journey[]>(
    () => buildAvailableJourneys(publishTarget),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unsectioned, publishTarget, journeyById]
  )

  // Touch activation differs by layout. The desktop card uses the whole
  // card as the draggable, so a 200ms long-press protects vertical
  // scrolling from accidentally turning into a drag. The mobile row
  // binds dnd-kit listeners only to a small drag-handle column, so a
  // distance-based activation gives immediate drag without the long-
  // press friction — and an accidental scroll-on-handle is impossible
  // because the handle is a narrow ~44px column.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(
      TouchSensor,
      useMobileLayout
        ? { activationConstraint: { distance: 8 } }
        : { activationConstraint: { delay: 200, tolerance: 5 } }
    )
  )

  // Scan existing collection titles for the "Collection N" pattern and
  // return the smallest unused N (>= 1). The match is case-sensitive
  // and ignores extra whitespace — only the exact shape this handler
  // produces counts as "ours", so a user-renamed collection like
  // "Collection 7 — old" never collides with the next auto-name.
  function nextCollectionName(): string {
    const used = new Set<number>()
    for (const c of collections) {
      const match = /^Collection (\d+)$/.exec(c.title)
      if (match != null) used.add(Number(match[1]))
    }
    let n = 1
    while (used.has(n)) n += 1
    return `Collection ${n}`
  }

  async function handleCreate(): Promise<void> {
    // Button is only rendered after the teamId == null guard returns
    // early, so in practice teamId is always defined here. The runtime
    // check is also the TS narrowing — without it, `input.teamId` widens
    // to `string | undefined`.
    if (creatingRef.current || createLoading || teamId == null) return
    creatingRef.current = true
    try {
      await templateGalleryPageCreate({
        variables: {
          input: {
            teamId,
            title: nextCollectionName(),
            creatorName: '',
            journeyIds: []
          }
        }
      })
      if (mountedRef.current) {
        enqueueSnackbar(t('Collection created'), {
          variant: 'success',
          preventDuplicate: true
        })
      }
    } catch (error) {
      if (mountedRef.current) {
        enqueueSnackbar(
          error instanceof Error
            ? error.message
            : t("Couldn't create collection"),
          { variant: 'error', preventDuplicate: true }
        )
      }
    } finally {
      creatingRef.current = false
    }
  }
  function handleCloseEdit(): void {
    setEditTargetId(null)
  }
  function handleEdit(collection: TemplateGalleryPage): void {
    setEditTargetId(collection.id)
  }
  function handleOpenPublish(collection: TemplateGalleryPage): void {
    setPublishTargetId(collection.id)
  }
  function handleClosePublish(): void {
    setPublishTargetId(null)
  }

  function handleDragStart(event: DragStartEvent): void {
    // Refuse any new drag while a dialog is open (NES-1653) or a previous
    // mutation is still in flight — handleDragEnd would silently swallow
    // the drop, leaving the user with the impression their move vanished.
    if (dialogOpen || dragInFlightRef.current) {
      if (dragInFlightRef.current) {
        enqueueSnackbar(t('Finishing previous move…'), {
          variant: 'info',
          preventDuplicate: true
        })
      }
      return
    }
    setActiveDragId(String(event.active.id))
  }

  const handleDragEnd = useDragEndHandler({
    journeyById,
    templateIdToCollection,
    collectionsById,
    dragInFlightRef,
    setDragInFlight,
    setActiveDragId
  })

  if (teamId == null) {
    return (
      <Box sx={{ p: 4 }} data-testid="TemplateGalleryPageList">
        <Alert severity="info">
          {t('Select a team to view its collections.')}
        </Alert>
      </Box>
    )
  }

  if (
    (collectionsQuery.loading && collectionsQuery.data == null) ||
    (journeysQuery.loading && journeysQuery.data == null)
  ) {
    return (
      <Box
        sx={{ p: 4, display: 'flex', justifyContent: 'center' }}
        data-testid="TemplateGalleryPageList"
      >
        <CircularProgress />
      </Box>
    )
  }

  const activeDragJourney =
    activeDragId != null ? (journeyById.get(activeDragId) ?? null) : null

  return (
    <GalleryDialogLockContext.Provider value={galleryDialogLockValue}>
      <Box sx={{ p: { xs: 2, md: 4 } }} data-testid="TemplateGalleryPageList">
        {showCollectionsSection && (
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
            sx={{ mb: 3 }}
          >
            {/* min-width: 0 lets the title row shrink instead of pushing into
              the button on narrow viewports (NES-1652). */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
              sx={{ minWidth: 0, flex: 1 }}
            >
              <Typography variant="h4">{t('Collections')}</Typography>
              {onOpenInfo != null && (
                <IconButton
                  data-testid="TemplateInfoPanelMobileTrigger"
                  aria-label={t('Open template info')}
                  onClick={onOpenInfo}
                  size="small"
                  sx={{
                    display: { xs: 'inline-flex', md: 'none' },
                    color: 'text.secondary',
                    p: 0.5
                  }}
                >
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              )}
            </Stack>
            <IconButton
              aria-label={t('Create Collection')}
              size="small"
              onClick={() => {
                void handleCreate()
              }}
              disabled={createLoading}
              sx={{
                flexShrink: 0,
                border: 1.5,
                borderColor: 'text.secondary',
                borderRadius: 2,
                color: 'text.secondary'
              }}
              data-testid="CreateCollectionButton"
            >
              <Plus2Icon fontSize="small" />
            </IconButton>
          </Stack>
        )}

        {/* NES-1666: layer a DOM-level `inert` over the existing sensor-level
          NES-1653 lock. `interactionsLocked` already blocks drag-start and
          disables droppables, but cursor movement over droppables behind the
          dialog can still surface hover affordances and (per the QA repro
          on NES-1666) drive subtle re-renders that look like the template
          "moves" behind the dialog. `inert` on the DnD subtree makes the
          whole tree non-interactive at the DOM level — pointer / focus /
          keyboard — while leaving the portaled CollectionDialog (rendered
          outside this subtree) fully interactive. Tagged via data-testid so
          the spec can assert the attribute toggles correctly. */}
        <Box
          data-testid="TemplateGalleryDndScope"
          inert={dialogOpen}
          sx={{ display: 'contents' }}
        >
          <DndContext
            collisionDetection={
              useMobileLayout ? mobileCollisionDetection : closestCenter
            }
            // Re-measure droppables every frame while dragging. The mobile chip
            // row is sticky + horizontally scrollable, so a single drag-start
            // measurement goes stale as soon as anything scrolls — leaving
            // chips with hit-areas offset from where they're drawn.
            measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {useMobileLayout ? (
              <>
                <MobileCollectionRow
                  collections={collections}
                  allTemplatesCount={allTemplates.length}
                  selectedCollectionId={mobileFilterCollectionId}
                  onSelect={setMobileFilterCollectionId}
                  dropDisabled={interactionsLocked}
                />
                <MobileFilterHeaderStrip
                  selectedCollection={mobileSelectedCollection}
                  count={mobileFilteredJourneys.length}
                  onEdit={handleEdit}
                  onPublish={handleOpenPublish}
                  onUngroup={handleUngroup}
                  busy={
                    (mobileSelectedCollection != null &&
                      busyId === mobileSelectedCollection.id) ||
                    dragInFlight
                  }
                  canPublish={canPublish}
                  publishBlockedReason={
                    publishBlockedReason != null
                      ? t(publishBlockedReason)
                      : null
                  }
                />
                {mobileFilteredJourneys.length === 0 ? (
                  <Box
                    sx={{
                      p: 4,
                      color: 'text.disabled',
                      textAlign: 'center'
                    }}
                  >
                    <Typography variant="body2">
                      {mobileSelectedCollection != null
                        ? t(
                            'No templates yet — drag templates here to add them.'
                          )
                        : allTemplates.length === 0
                          ? t('No team templates yet.')
                          : t('All templates are in collections.')}
                    </Typography>
                  </Box>
                ) : (
                  <MobileTemplateList
                    journeys={mobileFilteredJourneys}
                    allowReorder={mobileSelectedCollection != null}
                    dragInFlight={interactionsLocked}
                  />
                )}
              </>
            ) : (
              <>
                {showCollectionsSection &&
                  (collections.length === 0 ? (
                    <Alert severity="info" sx={{ mb: 3 }}>
                      {t(
                        "You don't have any collections yet. Create your first collection to start grouping templates."
                      )}
                    </Alert>
                  ) : (
                    <Stack
                      spacing={2}
                      sx={{
                        mb: 4,
                        mx: (theme) =>
                          `calc(${theme.spacing(-COLLECTION_CARD_PADDING)} - ${COLLECTION_CARD_BORDER_WIDTH}px)`
                      }}
                    >
                      {collections.map((collection) => (
                        <DroppableCollectionWrapper
                          key={collection.id}
                          id={collection.id}
                          disabled={
                            collection.status ===
                              TemplateGalleryPageStatus.published ||
                            interactionsLocked ||
                            busyId === collection.id
                          }
                        >
                          <CollectionCard
                            collection={collection}
                            onEdit={handleEdit}
                            onPublish={handleOpenPublish}
                            onUngroup={handleUngroup}
                            busy={busyId === collection.id || dragInFlight}
                            canPublish={canPublish}
                            publishBlockedReason={
                              publishBlockedReason != null
                                ? t(publishBlockedReason)
                                : null
                            }
                          >
                            <DraggableJourneysGrid
                              journeys={
                                journeysByCollection.get(collection.id) ?? []
                              }
                              publishedLock={
                                collection.status ===
                                TemplateGalleryPageStatus.published
                              }
                              dragInFlight={interactionsLocked}
                            />
                          </CollectionCard>
                        </DroppableCollectionWrapper>
                      ))}
                    </Stack>
                  ))}

                <UnsectionedDroppable disabled={interactionsLocked}>
                  {unsectioned.length === 0 ? (
                    <Box
                      sx={{ p: 2, color: 'text.disabled', textAlign: 'center' }}
                    >
                      <Typography variant="caption">
                        {allTemplates.length === 0
                          ? t('No team templates yet.')
                          : t('All templates are in collections.')}
                      </Typography>
                    </Box>
                  ) : (
                    <DraggableJourneysGrid
                      journeys={unsectioned}
                      publishedLock={false}
                      dragInFlight={interactionsLocked}
                    />
                  )}
                </UnsectionedDroppable>
              </>
            )}

            {/* Default dropAnimation snaps the card back to its origin when a
            drop is rejected (published, no-op, etc.) and runs the standard
            "settle" animation when accepted — gives the user visual
            feedback either way. */}
            <DragOverlay
              modifiers={useMobileLayout ? [snapCenterToPointer] : undefined}
            >
              {activeDragJourney != null ? (
                useMobileLayout ? (
                  // Compact pill, centred on the pointer (see
                  // snapCenterToPointer). A full-width row ghost would cover the
                  // chip the user is dragging onto and hide its drop highlight.
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      maxWidth: 220,
                      px: 1.5,
                      py: 1,
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      boxShadow: 6,
                      cursor: 'grabbing',
                      opacity: 0.95,
                      pointerEvents: 'none'
                    }}
                  >
                    <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                      {activeDragJourney.title}
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ width: 280, cursor: 'grabbing', opacity: 0.95 }}>
                    <JourneyCard journey={activeDragJourney} />
                  </Box>
                )
              ) : null}
            </DragOverlay>
          </DndContext>
        </Box>

        {editTarget != null && (
          <CollectionDialog
            key={editTarget.id}
            open
            mode="edit"
            teamId={teamId}
            collection={editTarget}
            availableJourneys={editAvailableJourneys}
            parentBusy={dragInFlight}
            canPublish={canPublish}
            publishBlockedReason={
              publishBlockedReason != null ? t(publishBlockedReason) : null
            }
            onClose={handleCloseEdit}
          />
        )}
        {publishTarget != null && (
          <CollectionDialog
            // Distinct key prefix so React tears down the Formik instance
            // when the user pivots from Edit to Publish on the same
            // collection — without it, the edit form's dirty state would
            // leak into the publish dialog.
            key={`publish-${publishTarget.id}`}
            open
            mode="publish"
            teamId={teamId}
            collection={publishTarget}
            availableJourneys={publishAvailableJourneys}
            parentBusy={dragInFlight}
            canPublish={canPublish}
            publishBlockedReason={
              publishBlockedReason != null ? t(publishBlockedReason) : null
            }
            onClose={handleClosePublish}
            onPublished={handlePublished}
          />
        )}
        <CollectionPublishSuccessDialog
          open={publishSuccessCollection != null}
          publicUrl={
            publishSuccessCollection != null
              ? buildCollectionPublicUrl(publishSuccessCollection.slug)
              : null
          }
          slug={publishSuccessCollection?.slug ?? null}
          canPublish={canPublish}
          publishBlockedReason={
            publishBlockedReason != null ? t(publishBlockedReason) : null
          }
          onClose={handleClosePublishSuccess}
        />
      </Box>
    </GalleryDialogLockContext.Provider>
  )
}
