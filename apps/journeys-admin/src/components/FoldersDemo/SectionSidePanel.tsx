import CheckIcon from '@mui/icons-material/Check'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import X2Icon from '@core/shared/ui/icons/X2'

import type { Section } from './FoldersDemo'

const COLOR_OPTIONS = [
  { label: 'Mint', value: '#E8F5E9' },
  { label: 'Sky', value: '#E3F2FD' },
  { label: 'Peach', value: '#FFF3E0' },
  { label: 'Lavender', value: '#F3E5F5' },
  { label: 'Lemon', value: '#FFF9C4' },
  { label: 'Blush', value: '#FCE4EC' },
  { label: 'Cyan', value: '#E0F7FA' },
  { label: 'Lime', value: '#F1F8E9' },
  { label: 'Violet', value: '#EDE7F6' },
  { label: 'Coral', value: '#FBE9E7' },
  { label: 'White', value: '#FFFFFF' },
  { label: 'Light Grey', value: '#F5F5F5' }
]

interface SectionSidePanelProps {
  section: Section
  onClose: () => void
  onUpdateSection: (id: string, updates: Partial<Section>) => void
}

export function SectionSidePanel({
  section,
  onClose,
  onUpdateSection
}: SectionSidePanelProps): ReactElement {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Section Details
        </Typography>
        <IconButton
          onClick={onClose}
          aria-label="close section panel"
          edge="end"
          size="small"
        >
          <X2Icon />
        </IconButton>
      </Stack>

      <Box sx={{ overflowY: 'auto', flex: 1 }}>
        <Accordion
          defaultExpanded
          disableGutters
          elevation={0}
          sx={{ '&:before': { display: 'none' } }}
        >
          <AccordionSummary
            expandIcon={<ChevronDownIcon />}
            sx={{ px: 2.5 }}
            aria-label="toggle title and description"
          >
            <Typography variant="subtitle2">Title & Description</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2.5, pt: 0 }}>
            <Stack spacing={2}>
              <TextField
                label="Title"
                value={section.title}
                onChange={(e) =>
                  onUpdateSection(section.id, { title: e.target.value })
                }
                fullWidth
                size="small"
              />
              <TextField
                label="Description"
                value={section.description}
                onChange={(e) =>
                  onUpdateSection(section.id, {
                    description: e.target.value
                  })
                }
                fullWidth
                size="small"
                multiline
                rows={2}
              />
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  Background Color
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1
                  }}
                >
                  {COLOR_OPTIONS.map((color) => (
                    <IconButton
                      key={color.value}
                      onClick={() =>
                        onUpdateSection(section.id, {
                          backgroundColor: color.value
                        })
                      }
                      aria-label={`set background to ${color.label}`}
                      sx={{
                        width: 32,
                        height: 32,
                        backgroundColor: color.value,
                        border: '2px solid',
                        borderColor:
                          section.backgroundColor === color.value
                            ? 'primary.main'
                            : 'rgba(0,0,0,0.12)',
                        borderRadius: '50%',
                        p: 0,
                        '&:hover': {
                          backgroundColor: color.value,
                          borderColor: 'primary.main'
                        }
                      }}
                    >
                      {section.backgroundColor === color.value && (
                        <CheckIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                      )}
                    </IconButton>
                  ))}
                </Box>
              </Box>
            </Stack>
          </AccordionDetails>
        </Accordion>

        <Accordion
          disableGutters
          elevation={0}
          sx={{ '&:before': { display: 'none' } }}
        >
          <AccordionSummary
            expandIcon={<ChevronDownIcon />}
            sx={{ px: 2.5 }}
            aria-label="toggle more details"
          >
            <Typography variant="subtitle2">More Details</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2.5, pt: 0 }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  Page description/instructions
                </Typography>
                <TextField
                  value={section.pageDescription}
                  onChange={(e) =>
                    onUpdateSection(section.id, {
                      pageDescription: e.target.value
                    })
                  }
                  fullWidth
                  size="small"
                  multiline
                  rows={3}
                  placeholder="Enter page description or instructions..."
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  Creator Details
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ position: 'relative', flexShrink: 0 }}>
                    <Avatar
                      src={section.creatorImageUrl || undefined}
                      sx={{ width: 48, height: 48 }}
                    />
                    <IconButton
                      size="small"
                      aria-label="edit creator image"
                      sx={{
                        position: 'absolute',
                        bottom: -4,
                        right: -4,
                        backgroundColor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        width: 22,
                        height: 22,
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }}
                    >
                      <Edit2Icon sx={{ fontSize: 12 }} />
                    </IconButton>
                  </Box>
                  <TextField
                    value={section.creatorName}
                    onChange={(e) =>
                      onUpdateSection(section.id, {
                        creatorName: e.target.value
                      })
                    }
                    placeholder="Creator's info"
                    fullWidth
                    size="small"
                  />
                </Stack>
              </Box>

              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  Add PDF / Video with instructions
                </Typography>
                <TextField
                  value={section.pdfVideoUrl}
                  onChange={(e) =>
                    onUpdateSection(section.id, {
                      pdfVideoUrl: e.target.value
                    })
                  }
                  placeholder="Paste URL"
                  fullWidth
                  size="small"
                />
              </Box>
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  )
}
