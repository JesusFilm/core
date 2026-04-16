import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import AddIcon from '@mui/icons-material/Add'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import SearchIcon from '@mui/icons-material/Search'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { ReactElement, useCallback, useRef, useState } from 'react'
import { A11y } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { SwiperClass } from 'swiper/react'

import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'
import X2Icon from '@core/shared/ui/icons/X2'


import type { JourneyStatus } from '../JourneyList/JourneyListView/JourneyListView'
import { JourneySort, SortOrder } from '../JourneyList/JourneySort'
import { JourneyStatusFilter } from '../JourneyList/JourneyStatusFilter'

import { CollectionPreview } from './CollectionPreview'
import { CollectionSidePanel } from './CollectionSidePanel'
import {
  Collection,
  MOCK_TEMPLATES,
  MockTemplate,
  getNextPastelColor
} from './mockData'

import 'swiper/css'

function getTemplateById(id: string): MockTemplate | undefined {
  return MOCK_TEMPLATES.find((t) => t.id === id)
}

// Droppable chip for a collection in the horizontal scroll
function CollectionChip({
  collection,
  isActive,
  onClick
}: {
  collection: Collection
  isActive: boolean
  onClick: () => void
}): ReactElement {
  const { isOver, setNodeRef } = useDroppable({ id: collection.id })

  return (
    <Chip
      ref={setNodeRef}
      label={
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            {collection.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ({collection.templateIds.length})
          </Typography>
        </Stack>
      }
      onClick={onClick}
      sx={{
        height: 36,
        borderRadius: 2,
        backgroundColor: collection.backgroundColor,
        border: '2px solid',
        borderColor: isOver
          ? 'primary.main'
          : isActive
            ? 'primary.main'
            : 'rgba(0,0,0,0.08)',
        borderStyle: isOver ? 'dashed' : 'solid',
        cursor: 'pointer',
        flexShrink: 0,
        '& .MuiChip-label': { px: 1.5 }
      }}
    />
  )
}

function OpenCollectionDropZone({
  collectionId,
  isPublished,
  backgroundColor,
  children
}: {
  collectionId: string
  isPublished: boolean
  backgroundColor: string
  children: ReactElement | ReactElement[]
}): ReactElement {
  const { isOver, setNodeRef } = useDroppable({ id: collectionId })

  return (
    <Box
      ref={setNodeRef}
      sx={{
        // ~52px per line item (36px height + 8px padding + 8px gap) * 6 + 16px container padding
        maxHeight: 328,
        overflowY: 'auto',
        backgroundColor,
        borderRadius: 2,
        p: 2,
        flexShrink: 0,
        border: isOver
          ? isPublished
            ? '2px dashed'
            : '2px dashed'
          : '2px solid transparent',
        borderColor: isOver
          ? isPublished
            ? 'text.disabled'
            : 'primary.main'
          : 'transparent',
        transition: 'all 0.2s ease'
      }}
    >
      {children}
    </Box>
  )
}

function DroppableAllTemplates({
  children
}: {
  children: ReactElement
}): ReactElement {
  const { isOver, setNodeRef } = useDroppable({ id: 'unsectioned' })
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
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {children}
    </Box>
  )
}

// Template line item for mobile
function TemplateLineItem({
  template,
  dragDisabled = false,
  draggable = false
}: {
  template: MockTemplate
  dragDisabled?: boolean
  draggable?: boolean
}): ReactElement {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: draggable ? template.id : `static-${template.id}`,
    disabled: !draggable || dragDisabled
  })

  return (
    <Card
      ref={draggable ? setNodeRef : undefined}
      variant="outlined"
      {...(draggable && !dragDisabled ? { ...attributes, ...listeners } : {})}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 1,
        opacity: isDragging ? 0.3 : 1,
        cursor: draggable && !dragDisabled ? 'grab' : 'default',
        touchAction: 'none'
      }}
    >
      <Box
        component="img"
        src={template.imageUrl}
        alt={template.title}
        sx={{
          width: 48,
          height: 36,
          borderRadius: 1,
          objectFit: 'cover',
          flexShrink: 0
        }}
      />
      <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden', pr: 1 }}>
        <Typography
          variant="caption"
          sx={{ fontWeight: 600, display: 'block' }}
          noWrap
        >
          {template.title}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block' }}
          noWrap
        >
          {template.description}
        </Typography>
      </Box>
      <Chip
        size="small"
        label={template.languageCode}
        sx={{ fontSize: 10, height: 18, flexShrink: 0 }}
      />
    </Card>
  )
}

export function MobileCollectionsDemo(): ReactElement {
  const [collections, setCollections] = useState<Collection[]>([])
  const [unsectionedIds, setUnsectionedIds] = useState<string[]>(
    MOCK_TEMPLATES.map((t) => t.id)
  )
  const [openCollectionId, setOpenCollectionId] = useState<string | null>(null)
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [helpModalOpen, setHelpModalOpen] = useState(false)
  const swiperRef = useRef<SwiperClass | null>(null)
  const [activeSlide, setActiveSlide] = useState(0)

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

    if (targetCollection?.isPublished === true) return
    if (sourceCollection?.isPublished === true) return

    const isValidTarget =
      targetZone === 'unsectioned' || targetCollection != null
    if (!isValidTarget) return
    if (isInUnsectioned && targetZone === 'unsectioned') return
    if (sourceCollection != null && sourceCollection.id === targetZone) return

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

    if (targetZone === 'unsectioned') {
      setUnsectionedIds((prev) => [...prev, templateId])
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
    setCollections((prev) => [
      ...prev,
      {
        id: `collection-${Date.now()}`,
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
  }

  const handleDeleteCollection = (collectionId: string): void => {
    const collection = collections.find((c) => c.id === collectionId)
    if (collection == null) return
    setUnsectionedIds((prev) => [...prev, ...collection.templateIds])
    setCollections((prev) => prev.filter((c) => c.id !== collectionId))
    if (openCollectionId === collectionId) {
      setOpenCollectionId(null)
      setEditModalOpen(false)
    }
  }

  const handleUpdateCollection = useCallback(
    (id: string, updates: Partial<Collection>): void => {
      setCollections((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
      )
    },
    []
  )

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
      <Box
        sx={{
          mt: 2,
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 120px)'
        }}
      >
        {/* Collections horizontal bar */}
        <Box sx={{ mb: 2, flexShrink: 0 }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ mb: 1 }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {openCollection != null ? (
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Box
                    component="span"
                    onClick={() => setOpenCollectionId(null)}
                    sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                  >
                    Collections
                  </Box>
                  <ChevronRightIcon
                    sx={{ fontSize: 18, color: 'text.secondary' }}
                  />
                  <Box
                    component="span"
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: openCollection.backgroundColor,
                      display: 'inline-block',
                      border: '1px solid rgba(0,0,0,0.15)'
                    }}
                  />
                  <span>{openCollection.title}</span>
                </Stack>
              ) : (
                'Collections'
              )}
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            {openCollection != null && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => setEditModalOpen(true)}
                sx={{ textTransform: 'none', fontSize: 12 }}
              >
                Edit
              </Button>
            )}
            {openCollection == null && (
              <IconButton
                size="small"
                onClick={handleAddCollection}
                aria-label="create new collection"
              >
                <AddIcon fontSize="small" />
              </IconButton>
            )}
            <IconButton
              size="small"
              onClick={() => setHelpModalOpen(true)}
              aria-label="open help"
            >
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Stack>

          {/* Horizontal scroll of collection chips */}
          {openCollection == null && (
            <Stack
              direction="row"
              spacing={1}
              sx={{
                overflowX: 'auto',
                pb: 1,
                '&::-webkit-scrollbar': { height: 4 },
                '&::-webkit-scrollbar-thumb': {
                  borderRadius: 2,
                  backgroundColor: 'rgba(0,0,0,0.1)'
                }
              }}
            >
              {collections.map((c) => (
                <CollectionChip
                  key={c.id}
                  collection={c}
                  isActive={false}
                  onClick={() => setOpenCollectionId(c.id)}
                />
              ))}
              {collections.length === 0 && (
                <Typography variant="caption" color="text.secondary">
                  No collections yet. Tap + to create one.
                </Typography>
              )}
            </Stack>
          )}
        </Box>

        {/* Opened collection — droppable, with draggable templates */}
        {openCollection != null && (
          <OpenCollectionDropZone
            collectionId={openCollection.id}
            isPublished={openCollection.isPublished}
            backgroundColor={openCollection.backgroundColor}
          >
            {openCollection.templateIds.length === 0 ? (
              <Box
                sx={{
                  py: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Drag templates here from below.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1} sx={{ overflowY: 'auto' }}>
                {openCollection.templateIds.map((id) => {
                  const tmpl = getTemplateById(id)
                  if (tmpl == null) return null
                  return (
                    <TemplateLineItem
                      key={id}
                      template={tmpl}
                      draggable
                      dragDisabled={openCollection.isPublished}
                    />
                  )
                })}
              </Stack>
            )}
          </OpenCollectionDropZone>
        )}

        {/* All Templates */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            mt: openCollection != null ? 2 : 0
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ mb: 1, flexShrink: 0 }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              All Templates ({filteredUnsectionedIds.length})
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <TextField
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              placeholder="Search..."
              aria-label="search templates"
              sx={{ width: 140 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 16 }} />
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

          <DroppableAllTemplates>
            <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              <Stack spacing={1}>
                {filteredUnsectionedIds.map((id) => {
                  const template = getTemplateById(id)
                  if (template == null) return null
                  return (
                    <TemplateLineItem
                      key={id}
                      template={template}
                      draggable
                    />
                  )
                })}
              </Stack>
              {filteredUnsectionedIds.length === 0 && (
                <Box
                  sx={{
                    py: 3,
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
          </DroppableAllTemplates>
        </Box>
      </Box>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTemplate != null ? (
          <Box sx={{ width: 200 }}>
            <TemplateLineItem template={activeTemplate} />
          </Box>
        ) : null}
      </DragOverlay>

      {/* Edit + Preview — Swiper wraps two modal-style panels */}
      {openCollection != null && editModalOpen && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: (theme) => theme.zIndex.modal,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Backdrop */}
          <Box
            onClick={() => setEditModalOpen(false)}
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)'
            }}
          />

          {/* Swiper — each slide is a modal panel */}
          <Box
            sx={{
              position: 'relative',
              width: 'calc(100% - 32px)',
              maxWidth: 500,
              height: '85vh',
              maxHeight: 700,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <Swiper
              modules={[A11y]}
              spaceBetween={16}
              slidesPerView={1}
              onSwiper={(swiper) => { swiperRef.current = swiper }}
              onSlideChange={(swiper) => setActiveSlide(swiper.activeIndex)}
              style={{ width: '100%', flex: 1, minHeight: 0 }}
            >
              {/* Slide 1: Edit collection */}
              <SwiperSlide>
                <Box
                  sx={{
                    height: '100%',
                    backgroundColor: 'background.paper',
                    borderRadius: 3,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 24
                  }}
                >
                  <CollectionSidePanel
                    collection={openCollection}
                    onClose={() => setEditModalOpen(false)}
                    onUpdateCollection={handleUpdateCollection}
                    onDeleteCollection={handleDeleteCollection}
                    onPreview={() => swiperRef.current?.slideNext()}
                    isPreviewOpen={false}
                  />
                </Box>
              </SwiperSlide>

              {/* Slide 2: Page preview */}
              <SwiperSlide>
                <Box
                  sx={{
                    height: '100%',
                    backgroundColor: 'background.paper',
                    borderRadius: 3,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 24
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    sx={{ px: 2, py: 1.5, flexShrink: 0 }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => swiperRef.current?.slidePrev()}
                      aria-label="back to edit"
                    >
                      <ChevronLeftIcon />
                    </IconButton>
                    <Typography
                      variant="subtitle2"
                      sx={{ flex: 1, fontWeight: 600 }}
                    >
                      Page Preview
                    </Typography>
                  </Stack>
                  <Divider />
                  <Box sx={{ flex: 1, overflowY: 'auto' }}>
                    <CollectionPreview collection={openCollection} />
                  </Box>
                </Box>
              </SwiperSlide>
            </Swiper>

            {/* Pagination dots */}
            <Stack
              direction="row"
              spacing={1}
              justifyContent="center"
              sx={{ pt: 1.5, flexShrink: 0 }}
            >
              {[0, 1].map((i) => (
                <Box
                  key={i}
                  onClick={() => swiperRef.current?.slideTo(i)}
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor:
                      activeSlide === i ? 'primary.main' : 'rgba(0,0,0,0.2)',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Box>
      )}

      {/* Help Modal */}
      {helpModalOpen && (
        <Dialog
          open
          onClose={() => setHelpModalOpen(false)}
          fullScreen
        >
          <Stack
            direction="row"
            alignItems="center"
            sx={{ px: 2, py: 1.5 }}
          >
            <Typography variant="subtitle1" sx={{ flex: 1, fontWeight: 600 }}>
              Help
            </Typography>
            <IconButton
              size="small"
              onClick={() => setHelpModalOpen(false)}
              aria-label="close help"
            >
              <X2Icon />
            </IconButton>
          </Stack>
          <Divider />
          <DialogContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              What templates are about:
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3, lineHeight: 1.6 }}
            >
              You can share projects created on our platform with others. This
              allows you to track the performance of every project generated
              from your template.
            </Typography>

            {[
              {
                title: 'Template Types',
                content:
                  'Templates can be journeys, websites, or quick-start projects. Each type has different configuration options and sharing capabilities.'
              },
              {
                title: 'How to create',
                content:
                  'Create a new template from scratch or duplicate an existing journey. Customize the content, add images, and configure settings before publishing.'
              },
              {
                title: 'Tracking and Analytics',
                content:
                  'Monitor how your templates perform with detailed analytics. Track views, completions, and engagement across all projects created from your templates.'
              },
              {
                title: 'Sharing and Publishing',
                content:
                  'Publish templates to the library for others to discover. Share directly via link or make them available to specific teams.'
              }
            ].map((item) => (
              <Box key={item.title} sx={{ mb: 1 }}>
                <Divider />
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, py: 1.5 }}
                >
                  {item.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ pb: 1.5 }}
                >
                  {item.content}
                </Typography>
              </Box>
            ))}
          </DialogContent>
        </Dialog>
      )}
    </DndContext>
  )
}
