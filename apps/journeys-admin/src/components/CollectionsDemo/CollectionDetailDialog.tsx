import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import X2Icon from '@core/shared/ui/icons/X2'

import type { Collection, MockTemplate } from './mockData'
import { MOCK_TEMPLATES } from './mockData'

function getTemplateById(id: string): MockTemplate | undefined {
  return MOCK_TEMPLATES.find((t) => t.id === id)
}

interface CollectionDetailOverlayProps {
  collection: Collection
  onClose: () => void
  onRemoveTemplate: (collectionId: string, templateId: string) => void
}

export function CollectionDetailOverlay({
  collection,
  onClose,
  onRemoveTemplate
}: CollectionDetailOverlayProps): ReactElement {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'background.paper',
        zIndex: 5,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          px: 2.5,
          py: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexShrink: 0
        }}
      >
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: collection.backgroundColor,
            border: '2px solid rgba(0,0,0,0.15)',
            flexShrink: 0
          }}
        />
        <Typography variant="subtitle1" sx={{ flex: 1, fontWeight: 600 }}>
          {collection.title}
        </Typography>
        <Chip
          size="small"
          label={collection.isPublished ? 'Published' : 'Draft'}
          sx={{
            fontSize: 11,
            height: 24,
            backgroundColor: collection.isPublished
              ? 'success.light'
              : 'action.selected',
            color: collection.isPublished ? 'success.dark' : 'text.secondary'
          }}
        />
        <Typography variant="caption" color="text.secondary">
          {collection.templateIds.length}{' '}
          {collection.templateIds.length === 1 ? 'template' : 'templates'}
        </Typography>
        <IconButton
          onClick={onClose}
          aria-label="close collection detail"
          edge="end"
          size="small"
        >
          <X2Icon />
        </IconButton>
      </Stack>

      {/* Scrollable template list */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {collection.templateIds.length === 0 ? (
          <Box
            sx={{
              py: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No templates in this collection yet.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1}>
            {collection.templateIds.map((id) => {
              const tmpl = getTemplateById(id)
              if (tmpl == null) return null
              return (
                <Card
                  key={id}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    '&:hover .remove-btn': { opacity: 1 }
                  }}
                >
                  <Box
                    component="img"
                    src={tmpl.imageUrl}
                    alt={tmpl.title}
                    sx={{
                      width: 72,
                      height: 50,
                      borderRadius: 1,
                      objectFit: 'cover',
                      flexShrink: 0
                    }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" noWrap>
                      {tmpl.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'block'
                      }}
                    >
                      {tmpl.description}
                    </Typography>
                    <Chip
                      size="small"
                      label={tmpl.languageCode}
                      sx={{ mt: 0.5, fontSize: 10, height: 20 }}
                    />
                  </Box>
                  <IconButton
                    className="remove-btn"
                    size="small"
                    onClick={() => onRemoveTemplate(collection.id, id)}
                    aria-label={`remove ${tmpl.title} from collection`}
                    sx={{
                      opacity: 0,
                      transition: 'opacity 0.15s ease',
                      color: 'error.main',
                      flexShrink: 0
                    }}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </Card>
              )
            })}
          </Stack>
        )}
      </Box>
    </Box>
  )
}
