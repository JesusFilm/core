import {
  CollisionDetection,
  DndContext,
  DragOverlay,
  DragStartEvent,
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
import Typography from '@mui/material/Typography'
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
import { JourneyStatus } from '../../../__generated__/globalTypes'
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
  UnsectionedDroppable,
  parseDropZoneId,
  resolveSectionDrop
} from './Droppables'
import {
  GalleryDialogLockContext,
  GalleryDialogLockContextValue
} from './GalleryDialogLockContext'
import { useCollectionCollapse } from './useCollectionCollapse'
import { useCollectionMutations } from './useCollectionMutations'
import { useDragEndHandler } from './useDragEndHandler'

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

// Type-level fallback for `journeysByCollection.get()` — the memoized map
// sets an entry for every collection, so this is never actually reached;
// a stable identity (not an inline `[]`) keeps it harmless for the grid's
// memo if that invariant ever changes.
const NO_JOURNEYS: readonly Journey[] = []

// Nearest scrollable ancestor. journeys-admin scrolls inside an inner
// container (PageWrapper's MainPanelBody, `overflowY: auto`), not the
// window — so viewport-fill measurements must be taken relative to that
// container or they drift by exactly the container's scroll offset.
function getScrollParent(node: HTMLElement): HTMLElement | null {
  let parent = node.parentElement
  while (parent != null) {
    const { overflowY } = window.getComputedStyle(parent)
    if (overflowY === 'auto' || overflowY === 'scroll') return parent
    parent = parent.parentElement
  }
  return null
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

  // Collections + DnD are only meaningful in the active view. In archived
  // or trashed views the user is curating those buckets, not assigning to
  // public gallery pages.
  const showCollections = status === 'active'

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
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  // NES-1703: size the gallery column to fill exactly the space between
  // its own top and the bottom of the viewport, so the unsectioned
  // droppable ends flush with the visible screen instead of adding a
  // viewportful of scroll below the navbar/tabs. Callback-ref state (not
  // useRef) because the root Box mounts after the loading early-returns —
  // a mount-time effect would fire before the node exists.
  //
  // Gated on `visible`: the Team Templates TabPanel keeps this component
  // mounted but display:none while another tab is active, where
  // getBoundingClientRect().top reads 0 and would lock in a bogus
  // viewport-tall min-height. The effect re-runs when the tab becomes
  // visible, so the measurement always happens on a laid-out node.
  //
  // The min-height is written straight to the node (not React state):
  // a resize tick then costs one rAF-throttled style write instead of a
  // full gallery re-render + a new emotion class per unique value. Safe
  // because nothing else manages this node's inline style. innerHeight
  // (not 100vh) so mobile browsers' URL-bar chrome is accounted for.
  const [rootNode, setRootNode] = useState<HTMLDivElement | null>(null)
  useEffect(() => {
    if (rootNode == null || !visible) return
    let frame: number | null = null
    function measureGalleryMinHeight(): void {
      if (rootNode == null) return
      // Not laid out yet — `visible` derives from the router and can flip
      // true a beat before the ancestor TabPanel's `hidden` state syncs
      // (child effects run first), so the node may still be display:none
      // here. Skip; the ResizeObserver below fires again the moment the
      // panel unhides and the node gains a real size.
      if (rootNode.getClientRects().length === 0) return
      const rootTop = rootNode.getBoundingClientRect().top
      const scrollParent = getScrollParent(rootNode)
      // Offset from the top of the scrolling context's CONTENT (not the
      // viewport) so the value is stable regardless of current scroll
      // position, paired with that context's visible height.
      const topOffset =
        scrollParent != null
          ? rootTop -
            scrollParent.getBoundingClientRect().top +
            scrollParent.scrollTop
          : rootTop + window.scrollY
      const viewportHeight =
        scrollParent != null ? scrollParent.clientHeight : window.innerHeight
      rootNode.style.minHeight = `${Math.max(
        0,
        Math.round(viewportHeight - topOffset)
      )}px`
    }
    function handleResize(): void {
      if (frame != null) return
      frame = window.requestAnimationFrame(() => {
        frame = null
        measureGalleryMinHeight()
      })
    }
    measureGalleryMinHeight()
    window.addEventListener('resize', handleResize)
    // Re-measure when the node's own size changes: covers the hidden→
    // visible transition above and width changes from panel/drawer
    // layout shifts. Guarded — jsdom has no ResizeObserver.
    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(handleResize)
        : null
    resizeObserver?.observe(rootNode)
    return () => {
      window.removeEventListener('resize', handleResize)
      resizeObserver?.disconnect()
      if (frame != null) window.cancelAnimationFrame(frame)
    }
  }, [rootNode, visible])
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

  // NES-1717: per-collection collapse state, persisted per team in
  // localStorage. Default is expanded; a collapsed collection hides its grid
  // but its header stays a valid drop target. The live ids let the hook
  // prune persisted entries for deleted collections.
  const collectionIds = useMemo(
    () => collections.map((collection) => collection.id),
    [collections]
  )
  const { isCollapsed, toggle: toggleCollapse } = useCollectionCollapse(
    teamId,
    collectionIds
  )
  const handleToggleCollapse = useCallback(
    (collection: TemplateGalleryPage): void => {
      toggleCollapse(collection.id)
    },
    [toggleCollapse]
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

  // Pool the dialog's template picker draws from. Only ungrouped templates
  // are addable, plus the templates already in the collection being
  // edited so the user can deselect them. Hides templates owned by other
  // collections to prevent accidental dual-membership.
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

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 }
    })
  )

  // Pointer-based collision detection, two-level (the dnd-kit "multiple
  // containers" pattern). `closestCenter` alone resolved the target from the
  // *dragged card's* centre — offset from the cursor by the grab point and
  // competing with the wide section droppables — leaving dead bands where a
  // drop landed nowhere. `pointerWithin` keys off the real cursor instead.
  //
  // From the pointer collisions, `resolveSectionDrop` decides intent: moving
  // into a section targets the whole section (so the collection is one drop
  // zone and its highlight lights anywhere inside it); reordering within a
  // collection targets the nearest card *within that collection* via a scoped
  // `closestCenter`, so the slot resolves even when the cursor is in the gap
  // between cards (where `pointerWithin` only sees the container).
  //
  // When the cursor is outside every droppable we fall back to the raw
  // `closestCenter` WITHOUT promoting to a section — a drop in dead space must
  // not silently reassign a template's collection.
  const collisionDetection = useCallback<CollisionDetection>(
    (args) => {
      const pointerCollisions = pointerWithin(args)
      if (pointerCollisions.length === 0) return closestCenter(args)

      const resolution = resolveSectionDrop(
        pointerCollisions,
        String(args.active.id),
        templateIdToCollection
      )
      if (resolution.kind === 'passthrough') return pointerCollisions
      if (resolution.kind === 'section') return [resolution.collision]

      // reorder: nearest card within the dragged card's own collection.
      const cardCollisions = closestCenter({
        ...args,
        droppableContainers: args.droppableContainers.filter((container) => {
          const id = String(container.id)
          return (
            parseDropZoneId(id) == null &&
            templateIdToCollection.get(id)?.id === resolution.collectionId
          )
        })
      })
      return cardCollisions.length > 0 ? cardCollisions : pointerCollisions
    },
    [templateIdToCollection]
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

  // A cancelled drag (Escape, touchcancel) fires onDragCancel, not
  // onDragEnd — without this the DragOverlay clone lingers and the
  // placeholder tiles stay in their drag-active style.
  function handleDragCancel(): void {
    setActiveDragId(null)
  }

  const handleDragEnd = useDragEndHandler({
    journeyById,
    templateIdToCollection,
    collectionsById,
    dragInFlightRef,
    setDragInFlight,
    setActiveDragId,
    isCollectionCollapsed: isCollapsed
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
      <Box
        ref={setRootNode}
        sx={{
          p: 4,
          // NES-1703: flex column filling the measured gap to the bottom
          // of the viewport (min-height is written directly to the node
          // by the measurement effect above) so the unsectioned droppable
          // can grow into it — a big, easy drop target for pulling
          // templates out of collections, without pushing extra scroll
          // below the fold.
          display: 'flex',
          flexDirection: 'column'
        }}
        data-testid="TemplateGalleryPageList"
      >
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
          // A real flex box (not `display: contents`) so the wrapper is a
          // grown flex item of the gallery column AND its own column for
          // the droppables — UnsectionedDroppable's flexGrow reaches the
          // page bottom through it, and any future styling on this
          // wrapper (e.g. locked-state dimming) won't be silently
          // discarded the way `display: contents` discards all styling.
          sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
        >
          <DndContext
            collisionDetection={collisionDetection}
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
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
                    // Stretch each collection box outward by the
                    // CollectionCard's inner horizontal padding + border, so
                    // the card grid inside spans the same width as the All
                    // Templates grid below and the cards column-align
                    // (NES-1696). Both sides derive from collectionLayout.
                    mx: (theme) =>
                      `calc(${theme.spacing(-COLLECTION_CARD_PADDING)} - ${COLLECTION_CARD_BORDER_WIDTH}px)`
                  }}
                >
                  {collections.map((collection) => (
                    <DroppableCollectionWrapper
                      key={collection.id}
                      id={collection.id}
                      disabled={interactionsLocked || busyId === collection.id}
                    >
                      <CollectionCard
                        collection={collection}
                        onEdit={handleEdit}
                        onUngroup={handleUngroup}
                        busy={busyId === collection.id || dragInFlight}
                        canPublish={canPublish}
                        publishBlockedReason={
                          publishBlockedReason != null
                            ? t(publishBlockedReason)
                            : null
                        }
                        collapsed={isCollapsed(collection.id)}
                        onToggleCollapse={handleToggleCollapse}
                      >
                        <DraggableJourneysGrid
                          journeys={
                            journeysByCollection.get(collection.id) ??
                            NO_JOURNEYS
                          }
                          dragInFlight={interactionsLocked}
                          showDropPlaceholder
                        />
                      </CollectionCard>
                    </DroppableCollectionWrapper>
                  ))}
                </Stack>
              ))}

            <UnsectionedDroppable disabled={interactionsLocked}>
              {unsectioned.length === 0 ? (
                <Box sx={{ p: 2, color: 'text.disabled', textAlign: 'center' }}>
                  <Typography variant="caption">
                    {allTemplates.length === 0
                      ? t('No team templates yet.')
                      : t('All templates are in collections.')}
                  </Typography>
                </Box>
              ) : (
                <DraggableJourneysGrid
                  journeys={unsectioned}
                  dragInFlight={interactionsLocked}
                />
              )}
            </UnsectionedDroppable>

            {/* Default dropAnimation snaps the card back to its origin when a
            drop is a no-op (dead space, same slot) and runs the standard
            "settle" animation when accepted — gives the user visual
            feedback either way. */}
            <DragOverlay>
              {activeDragJourney != null ? (
                <Box sx={{ width: 280, cursor: 'grabbing', opacity: 0.95 }}>
                  {/* 'always': the clone never receives hover while
                      dnd-kit holds pointer capture, and the arrow staying
                      visible mid-drag reinforces "you're moving this". */}
                  <JourneyCard
                    journey={activeDragJourney}
                    showDragAffordance="always"
                  />
                </Box>
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
