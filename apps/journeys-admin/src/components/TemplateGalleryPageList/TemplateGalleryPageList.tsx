import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useMemo, useRef, useState } from 'react'

import { useTeam } from '@core/journeys/ui/TeamProvider'
import { useBreakpoints } from '@core/shared/ui/useBreakpoints'

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
import { useTemplateGalleryPagesQuery } from '../../libs/useTemplateGalleryPagesQuery'
import { JourneyCard } from '../JourneyList/JourneyCard'
import type { JourneyStatusFilter } from '../JourneyList/JourneyListView'

import { CollectionCard } from './CollectionCard'
import { CollectionDialog } from './CollectionDialog'
import { CollectionPublishSuccessDialog } from './CollectionPublishSuccessDialog'
import {
  DraggableJourneysGrid,
  DroppableCollectionWrapper,
  UnsectionedDroppable
} from './Droppables'
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
}

export function TemplateGalleryPageList({
  visible = true,
  status = 'active'
}: TemplateGalleryPageListProps = {}): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { activeTeam } = useTeam()
  const { enqueueSnackbar } = useSnackbar()
  const breakpoints = useBreakpoints()
  const teamId = activeTeam?.id

  // Collections + DnD are only meaningful in the active view. In archived
  // or trashed views the user is curating those buckets, not assigning to
  // public gallery pages.
  const showCollections = status === 'active'

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

  const {
    busyId,
    publish: rawPublish,
    unpublish: handleUnpublish,
    ungroup: handleUngroup
  } = useCollectionMutations()

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editTargetId, setEditTargetId] = useState<string | null>(null)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [dragInFlight, setDragInFlight] = useState(false)
  // Holds the just-published collection so the success dialog has a stable
  // reference to it (the gallery list cache may change underneath while the
  // user is still looking at the dialog).
  const [publishSuccessCollection, setPublishSuccessCollection] =
    useState<TemplateGalleryPage | null>(null)

  // True when any modal is open. While modal is open, page-level draggables
  // and droppables are disabled and any in-flight drag state is cleared
  // (NES-1653): cursor moves inside the dialog were continuing to drive
  // dnd-kit's SortableContext, rearranging the cards visible behind the
  // dialog because the DragOverlay (z-index 999) tracks cursor position
  // beneath the dialog (z-index 1300) even while hidden.
  const dialogOpen =
    createDialogOpen || editTargetId != null || publishSuccessCollection != null
  const interactionsLocked = dragInFlight || dialogOpen

  useEffect(() => {
    if (dialogOpen) {
      setActiveDragId(null)
    }
  }, [dialogOpen])

  async function handlePublish(collection: TemplateGalleryPage): Promise<void> {
    const published = await rawPublish(collection)
    if (published != null) setPublishSuccessCollection(published)
  }
  function handleClosePublishSuccess(): void {
    setPublishSuccessCollection(null)
  }

  const collections = useMemo<readonly TemplateGalleryPage[]>(
    () => collectionsQuery.data?.templateGalleryPages ?? [],
    [collectionsQuery.data]
  )
  const allTemplates = useMemo<readonly Journey[]>(
    () => journeysQuery.data?.journeys ?? [],
    [journeysQuery.data]
  )

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
  // are addable, plus (in edit mode) the templates already in the collection
  // being edited so the user can deselect them. Hides templates owned by
  // other collections to prevent accidental dual-membership.
  const editAvailableJourneys = useMemo<readonly Journey[]>(() => {
    if (editTarget == null) return unsectioned
    const seen = new Set(unsectioned.map((j) => j.id))
    // Resolve each template through journeyById so the picker always sees
    // the full Journey shape (the gallery fragment only carries id/title
    // and would not satisfy Journey on its own).
    const own = editTarget.templates
      .filter((tpl) => !seen.has(tpl.id))
      .map((tpl) => journeyById.get(tpl.id))
      .filter((j): j is Journey => j != null)
    return [...unsectioned, ...own]
  }, [unsectioned, editTarget, journeyById])

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 }
    })
  )

  function handleOpenCreate(): void {
    setCreateDialogOpen(true)
  }
  function handleCloseCreate(): void {
    setCreateDialogOpen(false)
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
    if (interactionsLocked) {
      if (dragInFlight) {
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
    dragInFlight,
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
    <Box sx={{ p: 4 }} data-testid="TemplateGalleryPageList">
      {showCollections && (
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          sx={{ mb: 3 }}
        >
          {/* min-width: 0 lets the description text wrap inside the flex
              row instead of pushing into the button on narrow viewports
              (NES-1652). */}
          <Stack sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="h4">{t('Collections')}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t('Group your team templates into a public gallery page.')}
            </Typography>
          </Stack>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenCreate}
            sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
            data-testid="CreateCollectionButton"
          >
            {breakpoints.sm ? t('Create Collection') : t('Create')}
          </Button>
        </Stack>
      )}

      <DndContext
        collisionDetection={closestCenter}
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {showCollections &&
          (collections.length === 0 ? (
            <Alert severity="info" sx={{ mb: 3 }}>
              {t(
                "You don't have any collections yet. Create your first collection to start grouping templates."
              )}
            </Alert>
          ) : (
            <Stack spacing={2} sx={{ mb: 4 }}>
              {collections.map((collection) => (
                <DroppableCollectionWrapper
                  key={collection.id}
                  id={collection.id}
                  disabled={
                    collection.status === TemplateGalleryPageStatus.published ||
                    interactionsLocked ||
                    busyId === collection.id
                  }
                >
                  <CollectionCard
                    collection={collection}
                    onEdit={handleEdit}
                    onPublish={handlePublish}
                    onUnpublish={handleUnpublish}
                    onUngroup={handleUngroup}
                    busy={busyId === collection.id || dragInFlight}
                  >
                    <DraggableJourneysGrid
                      journeys={journeysByCollection.get(collection.id) ?? []}
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

        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t('All Templates')}
          </Typography>
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
                publishedLock={false}
                dragInFlight={interactionsLocked}
              />
            )}
          </UnsectionedDroppable>
        </Box>

        {/* Default dropAnimation snaps the card back to its origin when a
            drop is rejected (published, no-op, etc.) and runs the standard
            "settle" animation when accepted — gives the user visual
            feedback either way. */}
        <DragOverlay>
          {activeDragJourney != null ? (
            <Box sx={{ width: 280, cursor: 'grabbing', opacity: 0.95 }}>
              <JourneyCard journey={activeDragJourney} />
            </Box>
          ) : null}
        </DragOverlay>
      </DndContext>

      {createDialogOpen && (
        <CollectionDialog
          open
          mode="create"
          teamId={teamId}
          availableJourneys={unsectioned}
          parentBusy={dragInFlight}
          onClose={handleCloseCreate}
        />
      )}
      {editTarget != null && (
        <CollectionDialog
          key={editTarget.id}
          open
          mode="edit"
          teamId={teamId}
          collection={editTarget}
          availableJourneys={editAvailableJourneys}
          parentBusy={dragInFlight}
          onClose={handleCloseEdit}
        />
      )}
      <CollectionPublishSuccessDialog
        open={publishSuccessCollection != null}
        publicUrl={
          publishSuccessCollection != null
            ? buildCollectionPublicUrl(publishSuccessCollection.slug)
            : null
        }
        onClose={handleClosePublishSuccess}
      />
    </Box>
  )
}
