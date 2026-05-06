import {
  DndContext,
  DragEndEvent,
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
import { ReactElement, useEffect, useMemo, useState } from 'react'

import { useTeam } from '@core/journeys/ui/TeamProvider'

import {
  GetAdminJourneysVariables,
  GetAdminJourneys_journeys as Journey
} from '../../../__generated__/GetAdminJourneys'
import { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../__generated__/GetTemplateGalleryPages'
import { TemplateGalleryPageStatus } from '../../../__generated__/globalTypes'
import { useAdminJourneysQuery } from '../../libs/useAdminJourneysQuery'
import { useTemplateGalleryPageAssignJourneyMutation } from '../../libs/useTemplateGalleryPageAssignJourneyMutation'
import { useTemplateGalleryPagesQuery } from '../../libs/useTemplateGalleryPagesQuery'
import { useTemplateGalleryPageReorderTemplateMutation } from '../../libs/useTemplateGalleryPageReorderTemplateMutation'
import { JourneyCard } from '../JourneyList/JourneyCard'

import { CollectionCard } from './CollectionCard'
import { CollectionDialog } from './CollectionDialog'
import { CollectionPublishSuccessDialog } from './CollectionPublishSuccessDialog'
import {
  DraggableJourneysGrid,
  DroppableCollectionWrapper,
  UnsectionedDroppable,
  parseDropZoneId
} from './Droppables'
import { useCollectionMutations } from './useCollectionMutations'

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
}

export function TemplateGalleryPageList({
  visible = true
}: TemplateGalleryPageListProps = {}): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { activeTeam } = useTeam()
  const { enqueueSnackbar } = useSnackbar()
  const teamId = activeTeam?.id

  const collectionsQuery = useTemplateGalleryPagesQuery(
    teamId != null ? { teamId } : undefined,
    { skip: teamId == null }
  )
  // cache-and-network: the "Make Template" mutation only writes an id-only
  // ref into adminJourneys, so a pure cache hit on re-mount would omit the
  // new template's display fields.
  const journeysQuery = useAdminJourneysQuery(
    {
      template: true,
      teamId
    } satisfies GetAdminJourneysVariables,
    { fetchPolicy: 'cache-and-network' }
  )

  // TabPanel keeps this component mounted once revealed, so cache-and-network
  // alone won't refire the network on re-visit; refetch when `visible` flips.
  useEffect(() => {
    if (!visible || teamId == null) return
    void journeysQuery.refetch()
    void collectionsQuery.refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, teamId])

  const [templateGalleryPageAssignJourney] =
    useTemplateGalleryPageAssignJourneyMutation()
  const [templateGalleryPageReorderTemplate] =
    useTemplateGalleryPageReorderTemplateMutation()
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

  async function handlePublish(
    collection: TemplateGalleryPage
  ): Promise<void> {
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

  const collectionsById = useMemo(() => {
    const map = new Map<string, TemplateGalleryPage>()
    for (const collection of collections) map.set(collection.id, collection)
    return map
  }, [collections])

  const unsectioned = useMemo<readonly Journey[]>(
    () =>
      allTemplates.filter(
        (journey) => !templateIdToCollection.has(journey.id)
      ),
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
    // Don't even paint a drag overlay if a previous mutation is still in
    // flight — handleDragEnd would silently swallow the drop, leaving the
    // user with the impression their move just vanished.
    if (dragInFlight) {
      enqueueSnackbar(t('Finishing previous move…'), {
        variant: 'info',
        preventDuplicate: true
      })
      return
    }
    setActiveDragId(String(event.active.id))
  }

  // Unified drop handler — dispatches to assignJourney (membership change)
  // or reorderTemplate (intra-collection move) based on (source, target).
  // Cross-collection drops append to the end. Published collections reject.
  async function handleDragEnd(event: DragEndEvent): Promise<void> {
    setActiveDragId(null)
    // Defensive — handleDragStart already short-circuits while a mutation
    // is in flight, but keep the guard so reorders can't interleave.
    if (dragInFlight) return
    const { active, over } = event
    if (over == null) return

    const templateId = String(active.id)
    const sourceCollection = templateIdToCollection.get(templateId) ?? null

    // overId is either a sortable item id (a journey id) or an encoded
    // drop-zone id from `encodeDropZoneId`.
    const overId = String(over.id)
    let targetCollectionId: string | null
    let targetIndex: number | null
    const overZone = parseDropZoneId(overId)
    if (overZone != null) {
      targetCollectionId = overZone.kind === 'collection' ? overZone.id : null
      targetIndex = null // dropped on the zone itself, not a specific item
    } else {
      // overId is another journey id. Look up its parent collection (or
      // unsectioned) and its index inside that list.
      const overCollection = templateIdToCollection.get(overId) ?? null
      targetCollectionId = overCollection?.id ?? null
      if (overCollection != null) {
        targetIndex = overCollection.templates.findIndex(
          (tpl) => tpl.id === overId
        )
      } else {
        targetIndex = null // unsectioned: order is implicit, no reorder there
      }
    }

    // unsectioned -> unsectioned: no-op
    if (sourceCollection == null && targetCollectionId == null) return

    // Published guard on either side blocks every kind of move.
    if (sourceCollection?.status === TemplateGalleryPageStatus.published) return
    if (targetCollectionId != null) {
      const targetCollection = collectionsById.get(targetCollectionId)
      if (targetCollection?.status === TemplateGalleryPageStatus.published) return
    }

    setDragInFlight(true)
    try {
      const sameCollection =
        sourceCollection != null &&
        targetCollectionId != null &&
        sourceCollection.id === targetCollectionId

      if (sameCollection) {
        // Intra-collection reorder. If we don't know the target index
        // (dropped on the zone background), no-op rather than guess.
        if (targetIndex == null) return
        const sourceIndex = sourceCollection.templates.findIndex(
          (tpl) => tpl.id === templateId
        )
        if (sourceIndex < 0 || sourceIndex === targetIndex) return
        await templateGalleryPageReorderTemplate({
          variables: {
            pageId: sourceCollection.id,
            journeyId: templateId,
            order: targetIndex
          }
        })
      } else {
        // Membership change: cross-collection move, add from unsectioned, or
        // remove back to unsectioned. The server enforces the
        // single-membership invariant; passing pageId: null unassigns.
        await templateGalleryPageAssignJourney({
          variables: { journeyId: templateId, pageId: targetCollectionId }
        })
      }
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : t("Couldn't move template"),
        { variant: 'error', preventDuplicate: true }
      )
    } finally {
      setDragInFlight(false)
    }
  }

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
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Stack>
          <Typography variant="h4">{t('Collections')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t('Group your team templates into a public gallery page.')}
          </Typography>
        </Stack>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenCreate}
          data-testid="CreateCollectionButton"
        >
          {t('Create Collection')}
        </Button>
      </Stack>

      <DndContext
        collisionDetection={closestCenter}
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {collections.length === 0 ? (
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
                  dragInFlight ||
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
                    journeys={collection.templates
                      .map((tpl) => journeyById.get(tpl.id))
                      .filter((j): j is Journey => j != null)}
                    publishedLock={collection.status === TemplateGalleryPageStatus.published}
                    dragInFlight={dragInFlight}
                  />
                </CollectionCard>
              </DroppableCollectionWrapper>
            ))}
          </Stack>
        )}

        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t('All Templates')}
          </Typography>
          <UnsectionedDroppable disabled={dragInFlight}>
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
                dragInFlight={dragInFlight}
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

