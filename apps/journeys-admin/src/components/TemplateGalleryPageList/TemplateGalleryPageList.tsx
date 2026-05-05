import { ApolloError } from '@apollo/client'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useMemo, useState } from 'react'

import { useTeam } from '@core/journeys/ui/TeamProvider'

import {
  GetAdminJourneys,
  GetAdminJourneysVariables,
  GetAdminJourneys_journeys as Journey
} from '../../../__generated__/GetAdminJourneys'
import { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../__generated__/GetTemplateGalleryPages'
import { useAdminJourneysQuery } from '../../libs/useAdminJourneysQuery'
import { useTemplateGalleryPageAssignJourneyMutation } from '../../libs/useTemplateGalleryPageAssignJourneyMutation'
import { useTemplateGalleryPageDeleteMutation } from '../../libs/useTemplateGalleryPageDeleteMutation'
import { useTemplateGalleryPagePublishMutation } from '../../libs/useTemplateGalleryPagePublishMutation'
import { useTemplateGalleryPagesQuery } from '../../libs/useTemplateGalleryPagesQuery'
import { useTemplateGalleryPageUnpublishMutation } from '../../libs/useTemplateGalleryPageUnpublishMutation'
import { JourneyCard } from '../JourneyList/JourneyCard'

import { CollectionCard } from './CollectionCard'
import { CollectionDialog } from './CollectionDialog'

type DropZoneId = { kind: 'unsectioned' } | { kind: 'collection'; id: string }

const UNSECTIONED_ID = 'unsectioned'
const COLLECTION_PREFIX = 'collection:'

function encodeDropZoneId(zone: DropZoneId): string {
  return zone.kind === 'unsectioned'
    ? UNSECTIONED_ID
    : `${COLLECTION_PREFIX}${zone.id}`
}

function parseDropZoneId(raw: string | number): DropZoneId | null {
  const value = String(raw)
  if (value === UNSECTIONED_ID) return { kind: 'unsectioned' }
  if (value.startsWith(COLLECTION_PREFIX)) {
    return { kind: 'collection', id: value.slice(COLLECTION_PREFIX.length) }
  }
  return null
}

export function TemplateGalleryPageList(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { activeTeam } = useTeam()
  const { enqueueSnackbar } = useSnackbar()
  const router = useRouter()
  const teamId = activeTeam?.id

  const collectionsQuery = useTemplateGalleryPagesQuery(
    teamId != null ? { teamId } : undefined,
    { skip: teamId == null }
  )
  // Show all team templates regardless of status. The published-only filter
  // applies to global templates (jfp-team) rendered on the public template
  // library; team templates can be grouped into a Collection while still in
  // draft status.
  // `cache-and-network` so newly-created templates show up without a manual
  // page refresh — the "Make Template" mutation only writes a partial
  // (id-only) ref into the adminJourneys cache, so a pure cache hit on
  // re-mount would otherwise omit the new template's display fields.
  const journeysQuery = useAdminJourneysQuery(
    {
      template: true,
      teamId
    } satisfies GetAdminJourneysVariables,
    { fetchPolicy: 'cache-and-network' }
  ) as ReturnType<typeof useAdminJourneysQuery> & { data?: GetAdminJourneys }

  // Refetch when the user navigates BACK to the Collections tab.
  // The shared TabPanel keeps this component mounted across tab switches once
  // visible (only flips its `unmount` state false-once), so cache-and-network
  // alone won't refire the network on re-visit. Watch the `type` query
  // param and refetch both lists whenever it becomes `collections`.
  const isCollectionsTabActive = router.query.type === 'collections'
  useEffect(() => {
    if (!isCollectionsTabActive || teamId == null) return
    void journeysQuery.refetch()
    void collectionsQuery.refetch()
    // refetch fns identity changes every render; depending on the active-tab
    // signal + teamId is the right semantics.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCollectionsTabActive, teamId])

  const [templateGalleryPageAssignJourney] =
    useTemplateGalleryPageAssignJourneyMutation()
  const [templateGalleryPagePublish] = useTemplateGalleryPagePublishMutation()
  const [templateGalleryPageUnpublish] =
    useTemplateGalleryPageUnpublishMutation()
  const [templateGalleryPageDelete] = useTemplateGalleryPageDeleteMutation()

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editTargetId, setEditTargetId] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [dragInFlight, setDragInFlight] = useState(false)

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

  const collectedIds = useMemo(() => {
    const set = new Set<string>()
    for (const collection of collections) {
      for (const template of collection.templates) set.add(template.id)
    }
    return set
  }, [collections])

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
    () => allTemplates.filter((journey) => !collectedIds.has(journey.id)),
    [allTemplates, collectedIds]
  )

  const editTarget =
    editTargetId != null ? (collectionsById.get(editTargetId) ?? null) : null

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

  async function handlePublish(collection: TemplateGalleryPage): Promise<void> {
    setBusyId(collection.id)
    try {
      await templateGalleryPagePublish({ variables: { id: collection.id } })
      enqueueSnackbar(t('Collection published'), {
        variant: 'success',
        preventDuplicate: true
      })
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error
          ? error.message
          : t("Couldn't publish collection"),
        { variant: 'error', preventDuplicate: true }
      )
    } finally {
      setBusyId(null)
    }
  }

  async function handleUnpublish(
    collection: TemplateGalleryPage
  ): Promise<void> {
    setBusyId(collection.id)
    try {
      await templateGalleryPageUnpublish({
        variables: { id: collection.id }
      })
      enqueueSnackbar(t('Collection unpublished'), {
        variant: 'success',
        preventDuplicate: true
      })
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error
          ? error.message
          : t("Couldn't unpublish collection"),
        { variant: 'error', preventDuplicate: true }
      )
    } finally {
      setBusyId(null)
    }
  }

  async function handleUngroup(collection: TemplateGalleryPage): Promise<void> {
    setBusyId(collection.id)
    try {
      await templateGalleryPageDelete({ variables: { id: collection.id } })
      enqueueSnackbar(t('Collection removed'), {
        variant: 'success',
        preventDuplicate: true
      })
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error
          ? error.message
          : t("Couldn't remove collection"),
        { variant: 'error', preventDuplicate: true }
      )
    } finally {
      setBusyId(null)
    }
  }

  function handleDragStart(event: DragStartEvent): void {
    setActiveDragId(String(event.active.id))
  }

  async function handleDragEnd(event: DragEndEvent): Promise<void> {
    setActiveDragId(null)
    if (dragInFlight) return
    const { active, over } = event
    if (over == null) return

    const templateId = String(active.id)
    const target = parseDropZoneId(over.id)
    if (target == null) return

    const sourceCollection = templateIdToCollection.get(templateId) ?? null
    const targetCollectionId = target.kind === 'collection' ? target.id : null

    // No-op transitions.
    if (sourceCollection?.id === targetCollectionId) return
    if (sourceCollection == null && targetCollectionId == null) return

    // Block drag involving a published collection (UI guard).
    if (sourceCollection?.status === 'published') return
    if (targetCollectionId != null) {
      const targetCollection = collectionsById.get(targetCollectionId)
      if (targetCollection?.status === 'published') return
    }

    setDragInFlight(true)
    try {
      // Atomic single-mutation drag-and-drop. The server enforces the
      // single-membership invariant: assigning a journey already in another
      // collection drops the existing join row in the same transaction;
      // `pageId: null` unassigns (returns the journey to the flat list).
      await templateGalleryPageAssignJourney({
        variables: { journeyId: templateId, pageId: targetCollectionId }
      })
    } catch (error) {
      enqueueSnackbar(
        error instanceof ApolloError || error instanceof Error
          ? error.message
          : t("Couldn't move template"),
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
                disabled={collection.status === 'published' || dragInFlight}
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
                    publishedLock={collection.status === 'published'}
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
              <Box sx={{ p: 1 }}>
                <Grid container spacing={4} rowSpacing={{ xs: 2.5, sm: 4 }}>
                  {unsectioned.map((journey) => (
                    <Grid
                      key={journey.id}
                      size={{ xs: 12, sm: 6, md: 6, lg: 3, xl: 3 }}
                    >
                      <DraggableJourney journey={journey} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </UnsectionedDroppable>
        </Box>

        <DragOverlay dropAnimation={null}>
          {activeDragJourney != null ? (
            <Box sx={{ width: 280, cursor: 'grabbing', opacity: 0.95 }}>
              <JourneyCard journey={activeDragJourney} />
            </Box>
          ) : null}
        </DragOverlay>
      </DndContext>

      <CollectionDialog
        open={createDialogOpen}
        mode="create"
        teamId={teamId}
        availableJourneys={allTemplates}
        onClose={handleCloseCreate}
      />
      {editTarget != null && (
        <CollectionDialog
          open
          mode="edit"
          teamId={teamId}
          collection={editTarget}
          availableJourneys={allTemplates}
          onClose={handleCloseEdit}
        />
      )}
    </Box>
  )
}

interface DroppableCollectionWrapperProps {
  id: string
  disabled: boolean
  children: ReactElement | ReactElement[]
}

function DroppableCollectionWrapper({
  id,
  disabled,
  children
}: DroppableCollectionWrapperProps): ReactElement {
  const { setNodeRef, isOver } = useDroppable({
    id: encodeDropZoneId({ kind: 'collection', id }),
    disabled
  })
  return (
    <Box
      ref={setNodeRef}
      sx={{
        outline: isOver ? '2px solid' : 'none',
        outlineColor: 'primary.main',
        borderRadius: 1
      }}
    >
      {children}
    </Box>
  )
}

interface DraggableJourneysGridProps {
  journeys: readonly Journey[]
  publishedLock: boolean
}

function DraggableJourneysGrid({
  journeys,
  publishedLock
}: DraggableJourneysGridProps): ReactElement | null {
  if (journeys.length === 0) return null
  return (
    <Box sx={{ mt: -1, p: 1 }}>
      <Grid container spacing={4} rowSpacing={{ xs: 2.5, sm: 4 }}>
        {journeys.map((journey) => (
          <Grid key={journey.id} size={{ xs: 12, sm: 6, md: 6, lg: 3, xl: 3 }}>
            <DraggableJourney journey={journey} disabled={publishedLock} />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

interface UnsectionedDroppableProps {
  disabled: boolean
  children: ReactElement | ReactElement[]
}

function UnsectionedDroppable({
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
  disabled?: boolean
}

function DraggableJourney({
  journey,
  disabled
}: DraggableJourneyProps): ReactElement {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: journey.id, disabled })
  const style =
    transform != null
      ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
      : undefined
  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      sx={{
        opacity: isDragging ? 0.4 : 1,
        touchAction: 'manipulation',
        cursor: disabled === true ? 'default' : 'grab'
      }}
    >
      <JourneyCard journey={journey} />
    </Box>
  )
}
