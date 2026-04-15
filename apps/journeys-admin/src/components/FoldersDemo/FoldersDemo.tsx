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
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { ReactElement, useState } from 'react'

import Edit2Icon from '@core/shared/ui/icons/Edit2'

import type { JourneyStatus } from '../JourneyList/JourneyListView/JourneyListView'
import { JourneySort, SortOrder } from '../JourneyList/JourneySort'
import { JourneyStatusFilter } from '../JourneyList/JourneyStatusFilter'

import { MockTemplateCard } from './MockTemplateCard'
import { MOCK_TEMPLATES, MockTemplate } from './mockData'
import { SectionSidePanel } from './SectionSidePanel'
import { TemplateInfoPanel } from './TemplateInfoPanel'

export interface Section {
  id: string
  title: string
  description: string
  pageDescription: string
  creatorName: string
  creatorImageUrl: string
  pdfVideoUrl: string
  templateIds: string[]
  backgroundColor: string
}

const PANEL_WIDTH = 375

const PASTEL_PALETTE = [
  '#E8F5E9', // mint green
  '#E3F2FD', // light blue
  '#FFF3E0', // peach
  '#F3E5F5', // lavender
  '#FFF9C4', // lemon
  '#FCE4EC', // blush pink
  '#E0F7FA', // pale cyan
  '#F1F8E9', // lime cream
  '#EDE7F6', // soft violet
  '#FBE9E7' // warm coral
]

let pastelIndex = 0
function getNextPastelColor(usedColors: Set<string>): string {
  const unused = PASTEL_PALETTE.find((c) => !usedColors.has(c))
  if (unused != null) return unused
  // All colors used — fall back to round-robin
  const color = PASTEL_PALETTE[pastelIndex % PASTEL_PALETTE.length]
  pastelIndex++
  return color
}

interface DroppableSectionProps {
  id: string
  children: ReactElement | ReactElement[]
}

function DroppableZone({ id, children }: DroppableSectionProps): ReactElement {
  const { isOver, setNodeRef } = useDroppable({ id })

  return (
    <Box
      ref={setNodeRef}
      sx={{
        minHeight: 80,
        borderRadius: 2,
        border: isOver ? '2px dashed' : '2px dashed transparent',
        borderColor: isOver ? 'primary.main' : 'transparent',
        backgroundColor: isOver ? 'action.hover' : 'transparent',
        transition: 'all 0.2s ease',
        p: isOver ? 1 : 0
      }}
    >
      {children}
    </Box>
  )
}

function getTemplateById(id: string): MockTemplate | undefined {
  return MOCK_TEMPLATES.find((t) => t.id === id)
}

export function FoldersDemo(): ReactElement {
  const [sections, setSections] = useState<Section[]>([])
  const [unsectionedIds, setUnsectionedIds] = useState<string[]>(
    MOCK_TEMPLATES.map((t) => t.id)
  )
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null
  )
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null)
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null)
  const [editingTitleValue, setEditingTitleValue] = useState('')
  const [filterStatus, setFilterStatus] = useState<JourneyStatus>('active')
  const [filterSortOrder, setFilterSortOrder] = useState<SortOrder | undefined>()

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 8 }
  })
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 5 }
  })
  const sensors = useSensors(mouseSensor, touchSensor)

  const selectedSection =
    sections.find((s) => s.id === selectedSectionId) ?? null

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
    const sourceSection = sections.find((s) =>
      s.templateIds.includes(templateId)
    )

    if (isInUnsectioned) {
      setUnsectionedIds((prev) => prev.filter((id) => id !== templateId))
    } else if (sourceSection != null) {
      if (sourceSection.id === targetZone) return
      setSections((prev) =>
        prev.map((s) =>
          s.id === sourceSection.id
            ? {
                ...s,
                templateIds: s.templateIds.filter((id) => id !== templateId)
              }
            : s
        )
      )
    }

    if (targetZone === 'unsectioned') {
      if (!isInUnsectioned) {
        setUnsectionedIds((prev) => [...prev, templateId])
      }
    } else {
      setSections((prev) =>
        prev.map((s) =>
          s.id === targetZone
            ? { ...s, templateIds: [...s.templateIds, templateId] }
            : s
        )
      )
    }
  }

  const getNextSectionName = (): string => {
    const existingTitles = new Set(sections.map((s) => s.title))
    if (!existingTitles.has('New Section')) return 'New Section'
    let counter = 2
    while (existingTitles.has(`New Section ${counter}`)) {
      counter++
    }
    return `New Section ${counter}`
  }

  const handleAddSection = (): void => {
    const title = getNextSectionName()
    const id = `section-${Date.now()}`
    const newSection: Section = {
      id,
      title,
      description: '',
      pageDescription: '',
      creatorName: '',
      creatorImageUrl: '',
      pdfVideoUrl: '',
      templateIds: [],
      backgroundColor: getNextPastelColor(
        new Set(sections.map((s) => s.backgroundColor))
      )
    }
    setSections((prev) => [...prev, newSection])
    setSelectedSectionId(id)
    setEditingTitleId(id)
    setEditingTitleValue(title)
  }

  const handleDeleteSection = (sectionId: string): void => {
    const section = sections.find((s) => s.id === sectionId)
    if (section == null) return

    setUnsectionedIds((prev) => [...prev, ...section.templateIds])
    setSections((prev) => prev.filter((s) => s.id !== sectionId))

    if (selectedSectionId === sectionId) {
      setSelectedSectionId(null)
    }
  }

  const handleUpdateSection = (
    id: string,
    updates: Partial<Section>
  ): void => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    )
  }

  const handleTitleDoubleClick = (section: Section): void => {
    setEditingTitleId(section.id)
    setEditingTitleValue(section.title)
  }

  const handleTitleSubmit = (): void => {
    if (editingTitleId == null) return
    const trimmed = editingTitleValue.trim()
    if (trimmed !== '') {
      handleUpdateSection(editingTitleId, { title: trimmed })
    }
    setEditingTitleId(null)
    setEditingTitleValue('')
  }

  const handleTitleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ): void => {
    if (e.key === 'Enter') {
      handleTitleSubmit()
    } else if (e.key === 'Escape') {
      setEditingTitleId(null)
      setEditingTitleValue('')
    }
  }

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
        sx={{ mt: { xs: 3, sm: 2 }, alignItems: 'flex-start' }}
      >
        {/* Main content area */}
        <Box sx={{ flex: 1, minWidth: 0, px: { xs: 5, sm: 0 } }}>
          {/* Add Section Card + Filters row */}
          <Stack
            direction="row"
            alignItems="center"
            sx={{ mb: 4 }}
          >
            <Card
              variant="outlined"
              onClick={handleAddSection}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleAddSection()
                }
              }}
              tabIndex={0}
              role="button"
              aria-label="add a new section"
              sx={{
                border: '2px dashed',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 3,
                cursor: 'pointer',
                maxWidth: 400,
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'action.hover'
                }
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <AddIcon color="action" />
                <Typography variant="subtitle2" color="text.secondary">
                  Add Section
                </Typography>
              </Stack>
            </Card>
            <Box sx={{ flexGrow: 1 }} />
            <Stack direction="row" alignItems="center" spacing={1}>
              <JourneyStatusFilter
                status={filterStatus}
                onChange={setFilterStatus}
              />
              <JourneySort
                sortOrder={filterSortOrder}
                onChange={setFilterSortOrder}
              />
            </Stack>
          </Stack>

          {/* Sections */}
          {sections.map((section) => (
            <Box
              key={section.id}
              sx={{
                mb: 4,
                backgroundColor: section.backgroundColor,
                borderRadius: 3,
                p: 3,
                border: '1px solid',
                borderColor:
                  selectedSectionId === section.id
                    ? 'primary.main'
                    : 'rgba(0,0,0,0.08)',
                transition: 'border-color 0.2s ease'
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 2 }}
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: section.backgroundColor,
                    border: '2px solid rgba(0,0,0,0.2)',
                    flexShrink: 0
                  }}
                />
                {editingTitleId === section.id ? (
                  <TextField
                    value={editingTitleValue}
                    onChange={(e) => setEditingTitleValue(e.target.value)}
                    onKeyDown={handleTitleKeyDown}
                    onBlur={handleTitleSubmit}
                    size="small"
                    variant="standard"
                    autoFocus
                    inputRef={(input) => {
                      if (input != null) {
                        input.select()
                      }
                    }}
                    inputProps={{
                      'aria-label': 'edit section title',
                      style: { fontSize: '1.25rem', fontWeight: 500 }
                    }}
                    sx={{ minWidth: 150 }}
                  />
                ) : (
                  <Typography
                    variant="h6"
                    onDoubleClick={() => handleTitleDoubleClick(section)}
                    sx={{ cursor: 'default', userSelect: 'none' }}
                  >
                    {section.title}
                  </Typography>
                )}
                <IconButton
                  size="small"
                  onClick={() => setSelectedSectionId(section.id)}
                  aria-label={`edit section ${section.title}`}
                >
                  <Edit2Icon fontSize="small" />
                </IconButton>
                {section.description !== '' && (
                  <Typography variant="body2" color="text.secondary">
                    — {section.description}
                  </Typography>
                )}
                <Box sx={{ flexGrow: 1 }} />
                <IconButton
                  size="small"
                  onClick={() => handleDeleteSection(section.id)}
                  aria-label={`delete section ${section.title}`}
                  sx={{ color: 'error.main' }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Stack>
              <DroppableZone id={section.id}>
                {section.templateIds.length > 0 ? (
                  <Grid container spacing={4} rowSpacing={{ xs: 2.5, sm: 4 }}>
                    {section.templateIds.map((tmplId) => {
                      const template = getTemplateById(tmplId)
                      if (template == null) return null
                      return (
                        <Grid
                          key={tmplId}
                          size={{ xs: 12, sm: 6, md: 6, lg: 4, xl: 3 }}
                        >
                          <MockTemplateCard template={template} />
                        </Grid>
                      )
                    })}
                  </Grid>
                ) : (
                  <Box
                    sx={{
                      py: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px dashed',
                      borderColor: 'rgba(0,0,0,0.15)',
                      borderRadius: 2
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Drag templates here
                    </Typography>
                  </Box>
                )}
              </DroppableZone>
            </Box>
          ))}

          {/* All Templates (unsectioned) */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              All Templates
            </Typography>
            <DroppableZone id="unsectioned">
              <Grid container spacing={4} rowSpacing={{ xs: 2.5, sm: 4 }}>
                {unsectionedIds.map((tmplId) => {
                  const template = getTemplateById(tmplId)
                  if (template == null) return null
                  return (
                    <Grid
                      key={tmplId}
                      size={{ xs: 12, sm: 6, md: 6, lg: 4, xl: 3 }}
                    >
                      <MockTemplateCard template={template} />
                    </Grid>
                  )
                })}
              </Grid>
            </DroppableZone>
            {unsectionedIds.length === 0 && (
              <Box
                sx={{
                  py: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  All templates have been organized into sections.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Right panel — always visible, sticky */}
        <Box
          sx={{
            width: PANEL_WIDTH,
            flexShrink: 0,
            position: 'sticky',
            top: 80,
            alignSelf: 'flex-start',
            height: `calc(100vh - 100px)`,
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            backgroundColor: 'background.paper',
            borderRadius: '12px',
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden'
          }}
        >
          {selectedSection != null ? (
            <SectionSidePanel
              section={selectedSection}
              onClose={() => setSelectedSectionId(null)}
              onUpdateSection={handleUpdateSection}
            />
          ) : (
            <TemplateInfoPanel />
          )}
        </Box>
      </Stack>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTemplate != null ? (
          <Box sx={{ width: 280 }}>
            <MockTemplateCard template={activeTemplate} isDragOverlay />
          </Box>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
