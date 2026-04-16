import CheckIcon from '@mui/icons-material/Check'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import VisibilityIcon from '@mui/icons-material/Visibility'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { ReactElement, useState } from 'react'

import Edit2Icon from '@core/shared/ui/icons/Edit2'
import X2Icon from '@core/shared/ui/icons/X2'

import type { Collection } from './mockData'

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

interface CollectionSidePanelProps {
  collection: Collection
  onClose: () => void
  onUpdateCollection: (id: string, updates: Partial<Collection>) => void
  onDeleteCollection: (id: string) => void
  onPreview: () => void
  isPreviewOpen: boolean
}

export function CollectionSidePanel({
  collection,
  onClose,
  onUpdateCollection,
  onDeleteCollection,
  onPreview,
  isPreviewOpen
}: CollectionSidePanelProps): ReactElement {
  const [unpublishDialogOpen, setUnpublishDialogOpen] = useState(false)

  const handlePublishToggle = (): void => {
    if (collection.isPublished) {
      setUnpublishDialogOpen(true)
    } else {
      onUpdateCollection(collection.id, { isPublished: true })
    }
  }

  const handleConfirmUnpublish = (): void => {
    onUpdateCollection(collection.id, { isPublished: false })
    setUnpublishDialogOpen(false)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          px: 2.5,
          py: 2,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Edit Collection
        </Typography>
        <IconButton
          onClick={onClose}
          aria-label="close collection panel"
          edge="end"
          size="small"
        >
          <X2Icon />
        </IconButton>
      </Stack>

      {/* Scrollable content */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, py: 2 }}>
        <Stack spacing={3}>
          {/* Preview button */}
          <Button
            variant="blockContained"
            startIcon={<VisibilityIcon />}
            onClick={onPreview}
            fullWidth
          >
            {isPreviewOpen ? 'Close Preview' : 'Preview Page'}
          </Button>

          {/* Publish toggle */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Publish Status
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography
                variant="caption"
                color={
                  collection.isPublished ? 'success.main' : 'text.secondary'
                }
              >
                {collection.isPublished ? 'Published' : 'Draft'}
              </Typography>
              <Switch
                size="small"
                checked={collection.isPublished}
                onChange={handlePublishToggle}
                aria-label="toggle publish status"
              />
            </Stack>
          </Stack>

          {/* Title */}
          <TextField
            label="Title"
            value={collection.title}
            onChange={(e) =>
              onUpdateCollection(collection.id, { title: e.target.value })
            }
            fullWidth
            size="small"
          />

          {/* Description */}
          <TextField
            label="Description"
            value={collection.description}
            onChange={(e) =>
              onUpdateCollection(collection.id, { description: e.target.value })
            }
            fullWidth
            size="small"
            multiline
            rows={3}
          />

          {/* Background Color */}
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
              Background Color
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {COLOR_OPTIONS.map((color) => (
                <IconButton
                  key={color.value}
                  onClick={() =>
                    onUpdateCollection(collection.id, {
                      backgroundColor: color.value
                    })
                  }
                  aria-label={`set background to ${color.label}`}
                  sx={{
                    width: 28,
                    height: 28,
                    backgroundColor: color.value,
                    border: '2px solid',
                    borderColor:
                      collection.backgroundColor === color.value
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
                  {collection.backgroundColor === color.value && (
                    <CheckIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                  )}
                </IconButton>
              ))}
            </Box>
          </Box>

          {/* Page description / instructions */}
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
              Page description / instructions
            </Typography>
            <TextField
              value={collection.pageDescription}
              onChange={(e) =>
                onUpdateCollection(collection.id, {
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

          {/* Creator details */}
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
              Creator Details
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ position: 'relative', flexShrink: 0 }}>
                <Avatar
                  src={collection.creatorImageUrl || undefined}
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
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}
                >
                  <Edit2Icon sx={{ fontSize: 12 }} />
                </IconButton>
              </Box>
              <TextField
                value={collection.creatorName}
                onChange={(e) =>
                  onUpdateCollection(collection.id, {
                    creatorName: e.target.value
                  })
                }
                placeholder="Creator's info"
                fullWidth
                size="small"
              />
            </Stack>
          </Box>

          {/* PDF / Video URL */}
          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
              Add PDF / Video with instructions
            </Typography>
            <TextField
              value={collection.pdfVideoUrl}
              onChange={(e) =>
                onUpdateCollection(collection.id, {
                  pdfVideoUrl: e.target.value
                })
              }
              placeholder="Paste URL"
              fullWidth
              size="small"
            />
          </Box>
        </Stack>
      </Box>

      {/* Delete — pinned to bottom */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          flexShrink: 0
        }}
      >
        <Button
          variant="outlined"
          color="error"
          size="small"
          startIcon={<DeleteOutlineIcon />}
          onClick={() => onDeleteCollection(collection.id)}
          fullWidth
          aria-label={`delete collection ${collection.title}`}
        >
          Delete Collection
        </Button>
      </Box>

      {/* Unpublish confirmation dialog */}
      <Dialog
        open={unpublishDialogOpen}
        onClose={() => setUnpublishDialogOpen(false)}
        aria-label="confirm unpublish"
      >
        <DialogTitle>Unpublish Collection?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Unpublishing &quot;{collection.title}&quot; will remove it from the
            public library. You will be able to edit templates in this
            collection again.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUnpublishDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmUnpublish}
            color="error"
            variant="contained"
          >
            Unpublish
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
