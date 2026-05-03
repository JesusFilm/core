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
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useMemo, useState } from 'react'

import { useTeam } from '@core/journeys/ui/TeamProvider'

import {
  GetAdminJourneys,
  GetAdminJourneysVariables
} from '../../../__generated__/GetAdminJourneys'
import {
  GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage,
  GetTemplateGalleryPages_templateGalleryPages_templates as TemplateGalleryPageTemplate
} from '../../../__generated__/GetTemplateGalleryPages'
import { JourneyStatus } from '../../../__generated__/globalTypes'
import { useAdminJourneysQuery } from '../../libs/useAdminJourneysQuery'
import { useTemplateGalleryPageAssignJourneyMutation } from '../../libs/useTemplateGalleryPageAssignJourneyMutation'
import { useTemplateGalleryPageDeleteMutation } from '../../libs/useTemplateGalleryPageDeleteMutation'
import { useTemplateGalleryPagePublishMutation } from '../../libs/useTemplateGalleryPagePublishMutation'
import { useTemplateGalleryPagesQuery } from '../../libs/useTemplateGalleryPagesQuery'
import { useTemplateGalleryPageUnpublishMutation } from '../../libs/useTemplateGalleryPageUnpublishMutation'

import { CollectionCard } from './CollectionCard'
import { CollectionDialog } from './CollectionDialog'
import { TemplateCard, TemplateCardTemplate } from './TemplateCard'

type DraggableJourney = {
  id: string
  title: string
  primaryImageBlock: { src: string | null; alt: string } | null
}

type DropZoneId =
  | { kind: 'unsectioned' }
  | { kind: 'collection'; id: string }

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
  const teamId = activeTeam?.id

  const collectionsQuery = useTemplateGalleryPagesQuery(
    teamId != null ? { teamId } : undefined,
    { skip: teamId == null }
  )
  const journeysQuery = useAdminJourneysQuery({
    template: true,
    teamId,
    status: [JourneyStatus.published]
  } satisfies GetAdminJourneysVariables) as ReturnType<
    typeof useAdminJourneysQuery
  > & { data?: GetAdminJourneys }

  const [templateGalleryPageAssignJourney] =
    useTemplateGalleryPageAssignJourneyMutation()
  const [templateGalleryPagePublish] =
    useTemplateGalleryPagePublishMutation()
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
  const allTemplates = useMemo<readonly DraggableJourney[]>(() => {
    const journeys = journeysQuery.data?.journeys ?? []
    return journeys.map((journey) => ({
      id: journey.id,
      title: journey.title,
      primaryImageBlock:
        journey.primaryImageBlock == null
          ? null
          : {
              src: journey.primaryImageBlock.src,
              alt: journey.primaryImageBlock.alt
            }
    }))
  }, [journeysQuery.data])

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

  const unsectioned = useMemo<readonly DraggableJourney[]>(
    () => allTemplates.filter((template) => !collectedIds.has(template.id)),
    [allTemplates, collectedIds]
  )

  const editTarget =
    editTargetId != null ? collectionsById.get(editTargetId) ?? null : null

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

  async function handlePublish(
    collection: TemplateGalleryPage
  ): Promise<void> {
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

  async function handleUngroup(
    collection: TemplateGalleryPage
  ): Promise<void> {
    setBusyId(collection.id)
    try {
      await templateGalleryPageDelete({ variables: { id: collection.id } })
      enqueueSnackbar(t('Collection ungrouped'), {
        variant: 'success',
        preventDuplicate: true
      })
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error
          ? error.message
          : t("Couldn't ungroup collection"),
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
    const targetCollectionId =
      target.kind === 'collection' ? target.id : null

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

  const activeDragTemplate =
    activeDragId != null
      ? allTemplates.find((tpl) => tpl.id === activeDragId) ?? null
      : null

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
                  collection.status === 'published' || dragInFlight
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
                  <DraggableTemplatesGrid
                    templates={collection.templates}
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
                    ? t('No published templates yet.')
                    : t('All templates are in collections.')}
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  p: 1,
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(2, 1fr)',
                    sm: 'repeat(3, 1fr)',
                    md: 'repeat(4, 1fr)',
                    lg: 'repeat(5, 1fr)'
                  },
                  gap: 1
                }}
              >
                {unsectioned.map((template) => (
                  <DraggableTemplate key={template.id} template={template} />
                ))}
              </Box>
            )}
          </UnsectionedDroppable>
        </Box>

        <DragOverlay dropAnimation={null}>
          {activeDragTemplate != null ? (
            <TemplateCard template={activeDragTemplate} isDragOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>

      <CollectionDialog
        open={createDialogOpen}
        mode="create"
        teamId={teamId}
        onClose={handleCloseCreate}
      />
      {editTarget != null && (
        <CollectionDialog
          open
          mode="edit"
          teamId={teamId}
          collection={editTarget}
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

interface DraggableTemplatesGridProps {
  templates: readonly TemplateGalleryPageTemplate[]
  publishedLock: boolean
}

function DraggableTemplatesGrid({
  templates,
  publishedLock
}: DraggableTemplatesGridProps): ReactElement | null {
  if (templates.length === 0) return null
  return (
    <Box
      sx={{
        mt: -1,
        p: 1,
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, 1fr)',
          sm: 'repeat(3, 1fr)',
          md: 'repeat(4, 1fr)',
          lg: 'repeat(5, 1fr)'
        },
        gap: 1
      }}
    >
      {templates.map((template) => {
        const adapted: TemplateCardTemplate = {
          id: template.id,
          title: template.title,
          primaryImageBlock:
            template.primaryImageBlock == null
              ? null
              : {
                  src: template.primaryImageBlock.src,
                  alt: template.primaryImageBlock.alt
                }
        }
        return (
          <DraggableTemplate
            key={template.id}
            template={adapted}
            disabled={publishedLock}
          />
        )
      })}
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

interface DraggableTemplateProps {
  template: TemplateCardTemplate
  disabled?: boolean
}

function DraggableTemplate({
  template,
  disabled
}: DraggableTemplateProps): ReactElement {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: template.id, disabled })
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
      sx={{ opacity: isDragging ? 0.4 : 1, touchAction: 'manipulation' }}
    >
      <TemplateCard template={template} />
    </Box>
  )
}
