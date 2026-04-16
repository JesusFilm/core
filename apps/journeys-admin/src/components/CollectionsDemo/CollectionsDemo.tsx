import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import AddIcon from '@mui/icons-material/Add'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import SearchIcon from '@mui/icons-material/Search'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import Fade from '@mui/material/Fade'
import Grid from '@mui/material/Grid'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { ReactElement, useCallback, useRef, useState } from 'react'

import { useBreakpoints } from '@core/shared/ui/useBreakpoints'

import { MockTemplateCard } from '../FoldersDemo/MockTemplateCard'

import type { JourneyStatus } from '../JourneyList/JourneyListView/JourneyListView'
import { JourneySort, SortOrder } from '../JourneyList/JourneySort'
import { JourneyStatusFilter } from '../JourneyList/JourneyStatusFilter'

import { CollectionCard } from './CollectionCard'
import { CollectionPreview } from './CollectionPreview'
import { CollectionSidePanel } from './CollectionSidePanel'
import { MobileCollectionsDemo } from './MobileCollectionsDemo'
import { TemplateInfoPanel } from './TemplateInfoPanel'
import {
  COLLECTION_CARD_HEIGHT,
  COLLECTION_CARD_INFO_HEIGHT,
  COLLECTION_CARD_MOSAIC_RATIO,
  COLLECTION_CARD_WIDTHS,
  Collection,
  MOCK_TEMPLATES,
  MockTemplate,
  SECTION_HEADER_HEIGHT,
  SECTION_PADDING,
  TEMPLATE_CARD_HEIGHT,
  getNextPastelColor
} from './mockData'

const PANEL_WIDTH = 375
// 1 card + header + padding
const MIN_COLLECTIONS_HEIGHT =
  COLLECTION_CARD_HEIGHT + SECTION_HEADER_HEIGHT + SECTION_PADDING
// 1 card + header + filter row + padding
const MIN_TEMPLATES_HEIGHT =
  TEMPLATE_CARD_HEIGHT + SECTION_HEADER_HEIGHT * 2 + SECTION_PADDING

function getTemplateById(id: string): MockTemplate | undefined {
  return MOCK_TEMPLATES.find((t) => t.id === id)
}

function DroppableZone({
  id,
  children
}: {
  id: string
  children: ReactElement
}): ReactElement {
  const { isOver, setNodeRef } = useDroppable({ id })
  return (
    <Box
      ref={setNodeRef}
      sx={{
        flex: 1,
        minHeight: 0,
        borderRadius: 2,
        border: isOver ? '2px dashed' : '2px dashed transparent',
        borderColor: isOver ? 'primary.main' : 'transparent',
        backgroundColor: isOver ? 'action.hover' : 'transparent',
        transition: 'all 0.2s ease',
        p: isOver ? 1 : 0,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {children}
    </Box>
  )
}

const CREATE_COLLECTION_DROP_ID = 'create-new-collection'

function CreateCollectionDropTarget({
  onClick
}: {
  onClick: () => void
}): ReactElement {
  const { isOver, setNodeRef } = useDroppable({ id: CREATE_COLLECTION_DROP_ID })
  return (
    <Box ref={setNodeRef} sx={{ width: COLLECTION_CARD_WIDTHS }}>
      <Card
        variant="outlined"
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onClick()
        }}
        tabIndex={0}
        role="button"
        aria-label="create new collection"
        sx={{
          border: '2px dashed',
          borderColor: isOver ? 'primary.main' : 'divider',
          cursor: 'pointer',
          backgroundColor: isOver ? 'action.hover' : 'transparent',
          transition: 'all 0.2s ease',
          overflow: 'hidden',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'action.hover'
          }
        }}
      >
        <Box
          sx={{
            aspectRatio: `${COLLECTION_CARD_MOSAIC_RATIO}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}
        >
          <AddIcon
            color={isOver ? 'primary' : 'action'}
            sx={{ fontSize: 32, mb: 1 }}
          />
          <Typography
            variant="body2"
            color={isOver ? 'primary' : 'text.secondary'}
          >
            {isOver ? 'Drop to create' : 'Create collection'}
          </Typography>
        </Box>
        <Box sx={{ height: COLLECTION_CARD_INFO_HEIGHT }} />
      </Card>
    </Box>
  )
}

function CollectionsDropZone({
  collectionId,
  isPublished,
  sx,
  children
}: {
  collectionId: string | null
  isPublished: boolean
  sx: Record<string, unknown>
  children: ReactElement | ReactElement[]
}): ReactElement {
  const { isOver, setNodeRef } = useDroppable({
    id: collectionId ?? 'collections-disabled',
    disabled: collectionId == null
  })

  const dropActive = collectionId != null && isOver

  return (
    <Tooltip
      title={dropActive && isPublished ? 'Published — templates locked' : ''}
      open={dropActive && isPublished}
      arrow
      placement="top"
    >
      <Box
        ref={collectionId != null ? setNodeRef : undefined}
        sx={{
          ...sx,
          ...(dropActive
            ? isPublished
              ? {
                  borderColor: 'text.disabled',
                  borderStyle: 'dashed',
                  borderWidth: 2
                }
              : {
                  borderColor: 'primary.main',
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  backgroundColor: 'action.hover'
                }
            : {})
        }}
      >
        {children}
      </Box>
    </Tooltip>
  )
}

function DesktopCollectionsDemo(): ReactElement {
  const [collections, setCollections] = useState<Collection[]>([])
  const [unsectionedIds, setUnsectionedIds] = useState<string[]>(
    MOCK_TEMPLATES.map((t) => t.id)
  )
  const [openCollectionId, setOpenCollectionId] = useState<string | null>(null)
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  // Resize
  const containerRef = useRef<HTMLDivElement>(null)
  const [topRatio, setTopRatio] = useState(0.4)
  const [isResizing, setIsResizing] = useState(false)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<JourneyStatus>('active')
  const [sortOrder, setSortOrder] = useState<SortOrder | undefined>()

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 8 }
  })
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 5 }
  })
  const sensors = useSensors(mouseSensor, touchSensor)

  const openCollection =
    collections.find((c) => c.id === openCollectionId) ?? null

  // --- Handlers ---

  const handleDragStart = (event: DragStartEvent): void => {
    setActiveTemplateId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent): void => {
    setActiveTemplateId(null)
    const { active, over } = event
    if (over == null) return

    const templateId = active.id as string
    const targetZone = over.id as string

    const isInUnsectioned = unsectionedIds.includes(templateId)
    const sourceCollection = collections.find((c) =>
      c.templateIds.includes(templateId)
    )
    const targetCollection = collections.find((c) => c.id === targetZone)

    // Block drag into/out of published collections
    if (targetCollection?.isPublished === true) return
    if (sourceCollection?.isPublished === true) return

    // Validate target is a known zone
    const isValidTarget =
      targetZone === 'unsectioned' ||
      targetZone === CREATE_COLLECTION_DROP_ID ||
      targetCollection != null
    if (!isValidTarget) return

    // No-op if dropping on the same zone
    if (isInUnsectioned && targetZone === 'unsectioned') return
    if (sourceCollection != null && sourceCollection.id === targetZone) return

    // Remove from source
    if (isInUnsectioned) {
      setUnsectionedIds((prev) => prev.filter((id) => id !== templateId))
    } else if (sourceCollection != null) {
      setCollections((prev) =>
        prev.map((c) =>
          c.id === sourceCollection.id
            ? {
                ...c,
                templateIds: c.templateIds.filter((id) => id !== templateId)
              }
            : c
        )
      )
    }

    // Add to target
    if (targetZone === 'unsectioned') {
      setUnsectionedIds((prev) => [...prev, templateId])
    } else if (targetZone === CREATE_COLLECTION_DROP_ID) {
      const existingTitles = new Set(collections.map((c) => c.title))
      let title = 'New Collection'
      if (existingTitles.has(title)) {
        let counter = 2
        while (existingTitles.has(`New Collection ${counter}`)) counter++
        title = `New Collection ${counter}`
      }
      const id = `collection-${Date.now()}`
      setCollections((prev) => [
        ...prev,
        {
          id,
          title,
          description: '',
          pageDescription: '',
          creatorName: '',
          creatorImageUrl: '',
          pdfVideoUrl: '',
          templateIds: [templateId],
          backgroundColor: getNextPastelColor(
            new Set(collections.map((c) => c.backgroundColor))
          ),
          isPublished: false
        }
      ])
    } else {
      setCollections((prev) =>
        prev.map((c) =>
          c.id === targetZone
            ? { ...c, templateIds: [...c.templateIds, templateId] }
            : c
        )
      )
    }
  }

  const handleAddCollection = (): void => {
    const existingTitles = new Set(collections.map((c) => c.title))
    let title = 'New Collection'
    if (existingTitles.has(title)) {
      let counter = 2
      while (existingTitles.has(`New Collection ${counter}`)) counter++
      title = `New Collection ${counter}`
    }

    const id = `collection-${Date.now()}`
    setCollections((prev) => [
      ...prev,
      {
        id,
        title,
        description: '',
        pageDescription: '',
        creatorName: '',
        creatorImageUrl: '',
        pdfVideoUrl: '',
        templateIds: [],
        backgroundColor: getNextPastelColor(
          new Set(prev.map((c) => c.backgroundColor))
        ),
        isPublished: false
      }
    ])
    setOpenCollectionId(id)
  }

  const handleDeleteCollection = (collectionId: string): void => {
    const collection = collections.find((c) => c.id === collectionId)
    if (collection == null) return
    setUnsectionedIds((prev) => [...prev, ...collection.templateIds])
    setCollections((prev) => prev.filter((c) => c.id !== collectionId))
    if (openCollectionId === collectionId) setOpenCollectionId(null)
  }

  const handleUpdateCollection = useCallback(
    (id: string, updates: Partial<Collection>): void => {
      setCollections((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
      )
    },
    []
  )

  const handleTogglePublish = (collectionId: string): void => {
    setCollections((prev) =>
      prev.map((c) =>
        c.id === collectionId ? { ...c, isPublished: !c.isPublished } : c
      )
    )
  }

  const handleRemoveTemplate = (
    collectionId: string,
    templateId: string
  ): void => {
    const collection = collections.find((c) => c.id === collectionId)
    if (collection?.isPublished === true) return

    setCollections((prev) =>
      prev.map((c) =>
        c.id === collectionId
          ? {
              ...c,
              templateIds: c.templateIds.filter((id) => id !== templateId)
            }
          : c
      )
    )
    setUnsectionedIds((prev) => [...prev, templateId])
  }

  const handleOpenCollection = (collectionId: string): void => {
    setOpenCollectionId(collectionId)
  }

  const handleCloseCollection = (): void => {
    setOpenCollectionId(null)
  }

  // Resize handle between sections
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    const startY = e.clientY
    const container = containerRef.current
    if (container == null) return
    const containerHeight = container.getBoundingClientRect().height
    const handleHeight = 8
    const usableHeight = containerHeight - handleHeight

    const handleMouseMove = (moveEvent: MouseEvent): void => {
      const offsetY =
        moveEvent.clientY - container.getBoundingClientRect().top
      const minRatio = MIN_COLLECTIONS_HEIGHT / usableHeight
      const maxRatio = 1 - MIN_TEMPLATES_HEIGHT / usableHeight
      const newRatio = Math.max(
        minRatio,
        Math.min(offsetY / usableHeight, maxRatio)
      )
      setTopRatio(newRatio)
    }
    const handleMouseUp = (): void => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [])

  // Filtered templates
  const filteredUnsectionedIds =
    searchQuery.trim() === ''
      ? unsectionedIds
      : unsectionedIds.filter((id) => {
          const t = getTemplateById(id)
          return (
            t != null &&
            t.title.toLowerCase().includes(searchQuery.toLowerCase())
          )
        })

  const activeTemplate =
    activeTemplateId != null ? getTemplateById(activeTemplateId) : null

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Stack
        direction="row"
        spacing={3}
        sx={{
          mt: { xs: 3, sm: 2 },
          height: 'calc(100vh - 140px)',
          alignItems: 'stretch'
        }}
      >
        {/* Main content */}
        <Box
          ref={containerRef}
          sx={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            userSelect: isResizing ? 'none' : 'auto'
          }}
        >
          {/* Collections section */}
          <CollectionsDropZone
            collectionId={openCollection?.id ?? null}
            isPublished={openCollection?.isPublished === true}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              p: 3,
              flex: `${topRatio} 0 0`,
              display: 'flex',
              flexDirection: 'column',
              minHeight: MIN_COLLECTIONS_HEIGHT,
              overflow: 'hidden',
              backgroundColor:
                openCollection?.backgroundColor ?? 'transparent',
              transition: 'background-color 0.3s ease'
            }}
          >
            {/* Breadcrumb header */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
              sx={{ mb: 1, flexShrink: 0 }}
            >
              <Typography
                variant="h6"
                onClick={
                  openCollection != null ? handleCloseCollection : undefined
                }
                sx={{
                  fontWeight: 600,
                  cursor: openCollection != null ? 'pointer' : 'default',
                  '&:hover':
                    openCollection != null ? { color: 'primary.main' } : {}
                }}
              >
                Collections
              </Typography>
              <Fade in={openCollection != null} timeout={300} unmountOnExit>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <ChevronRightIcon
                    sx={{ fontSize: 20, color: 'text.secondary' }}
                  />
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor:
                        openCollection?.backgroundColor ?? 'transparent',
                      border: '1.5px solid rgba(0,0,0,0.15)',
                      flexShrink: 0
                    }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {openCollection?.title}
                  </Typography>
                </Stack>
              </Fade>
            </Stack>

            {/* Content */}
            <Fade
              key={openCollection != null ? 'open' : 'grid'}
              in
              timeout={250}
            >
            <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              {openCollection != null ? (
                // Opened collection — same card style as All Templates
                openCollection.templateIds.length === 0 ? (
                  <Box
                    sx={{
                      py: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Drag templates here from All Templates below.
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={2} rowSpacing={2}>
                    {openCollection.templateIds.map((tmplId) => {
                      const template = getTemplateById(tmplId)
                      if (template == null) return null
                      return (
                        <Grid
                          key={tmplId}
                          size={{ xs: 12, sm: 6, lg: 4, xl: 3 }}
                        >
                          <MockTemplateCard
                            template={template}
                            dragDisabled={openCollection.isPublished}
                          />
                        </Grid>
                      )
                    })}
                  </Grid>
                )
              ) : (
                <Box
                  sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}
                >
                  {/* Always-first create card */}
                  <CreateCollectionDropTarget
                    onClick={handleAddCollection}
                  />
                  {collections.map((collection) => (
                    <Box
                      key={collection.id}
                      sx={{ width: COLLECTION_CARD_WIDTHS }}
                    >
                      <CollectionCard
                        collection={collection}
                        onOpen={handleOpenCollection}
                        onTogglePublish={handleTogglePublish}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
            </Fade>
          </CollectionsDropZone>

          {/* Resize handle */}
          <Box
            onMouseDown={handleResizeStart}
            sx={{
              height: 8,
              flexShrink: 0,
              cursor: 'row-resize',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '&:hover': { '& > div': { backgroundColor: 'error.dark' } }
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 3,
                borderRadius: 1.5,
                backgroundColor: 'error.main',
                transition: 'background-color 0.2s ease'
              }}
            />
          </Box>

          {/* All Templates section */}
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              p: 3,
              flex: `${1 - topRatio} 0 0`,
              display: 'flex',
              flexDirection: 'column',
              minHeight: MIN_TEMPLATES_HEIGHT,
              overflow: 'hidden'
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ mb: 2, flexShrink: 0 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                All Templates
                <Typography
                  component="span"
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 1 }}
                >
                  ({filteredUnsectionedIds.length})
                </Typography>
              </Typography>
              <Box sx={{ flexGrow: 1 }} />
              <TextField
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                placeholder="Search..."
                aria-label="search templates"
                sx={{ width: 200 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 18 }} />
                      </InputAdornment>
                    )
                  }
                }}
              />
              <JourneyStatusFilter
                status={filterStatus}
                onChange={setFilterStatus}
              />
              <JourneySort sortOrder={sortOrder} onChange={setSortOrder} />
            </Stack>

            <DroppableZone id="unsectioned">
              <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                <Grid container spacing={2} rowSpacing={2}>
                  {filteredUnsectionedIds.map((tmplId) => {
                    const template = getTemplateById(tmplId)
                    if (template == null) return null
                    return (
                      <Grid
                        key={tmplId}
                        size={{ xs: 12, sm: 6, lg: 4, xl: 3 }}
                      >
                        <MockTemplateCard template={template} />
                      </Grid>
                    )
                  })}
                </Grid>
                {filteredUnsectionedIds.length === 0 && (
                  <Box
                    sx={{
                      py: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {searchQuery.trim() !== ''
                        ? 'No templates match your search.'
                        : 'All templates are in collections.'}
                    </Typography>
                  </Box>
                )}
              </Box>
            </DroppableZone>
          </Box>
        </Box>

        {/* Right: Side panel */}
        <Box
          sx={{
            width: PANEL_WIDTH,
            flexShrink: 0,
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            backgroundColor: 'background.paper',
            borderRadius: '12px',
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
            zIndex: (theme) => theme.zIndex.modal,
            position: 'relative'
          }}
        >
          <Fade
            key={openCollection != null ? 'editor' : 'info'}
            in
            timeout={300}
          >
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {openCollection != null ? (
                <CollectionSidePanel
                  collection={openCollection}
                  onClose={handleCloseCollection}
                  onUpdateCollection={handleUpdateCollection}
                  onDeleteCollection={handleDeleteCollection}
                  onPreview={() => setPreviewOpen((prev) => !prev)}
                  isPreviewOpen={previewOpen}
                />
              ) : (
                <TemplateInfoPanel />
              )}
            </Box>
          </Fade>
        </Box>
      </Stack>

      {/* Shared backdrop — behind both preview modal and side panel */}
      {openCollection != null && previewOpen && (
        <Box
          onClick={() => setPreviewOpen(false)}
          sx={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: (theme) => theme.zIndex.modal - 1
          }}
        />
      )}

      {/* Preview modal — centered */}
      {openCollection != null && previewOpen && (
          <Dialog
            open
            onClose={() => setPreviewOpen(false)}
            maxWidth="sm"
            fullWidth
            hideBackdrop
            disableEnforceFocus
            disableAutoFocus
            disableRestoreFocus
            sx={{
              pointerEvents: 'none',
              '& .MuiDialog-paper': {
                pointerEvents: 'auto',
                height: '80vh',
                maxHeight: 720,
                aspectRatio: '16 / 10'
              }
            }}
          >
            <DialogTitle sx={{ pb: 1 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Page Preview
                </Typography>
                <Button
                  size="small"
                  onClick={() => setPreviewOpen(false)}
                  sx={{ textTransform: 'none' }}
                >
                  Close
                </Button>
              </Stack>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ p: 0 }}>
              <CollectionPreview collection={openCollection} />
            </DialogContent>
          </Dialog>
        )}

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTemplate != null ? (
          <Box sx={{ width: 240 }}>
            <MockTemplateCard template={activeTemplate} isDragOverlay />
          </Box>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export function CollectionsDemo(): ReactElement {
  const breakpoints = useBreakpoints()

  if (!breakpoints.sm) {
    return <MobileCollectionsDemo />
  }

  return <DesktopCollectionsDemo />
}
