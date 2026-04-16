import { useDroppable } from '@dnd-kit/core'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import type { Collection, MockTemplate } from './mockData'
import {
  COLLECTION_CARD_INFO_HEIGHT,
  COLLECTION_CARD_MOSAIC_RATIO,
  MOCK_TEMPLATES
} from './mockData'

function getTemplateById(id: string): MockTemplate | undefined {
  return MOCK_TEMPLATES.find((t) => t.id === id)
}

interface CollectionCardProps {
  collection: Collection
  onOpen: (collectionId: string) => void
  onTogglePublish: (collectionId: string) => void
}

export function CollectionCard({
  collection,
  onOpen,
  onTogglePublish
}: CollectionCardProps): ReactElement {
  const { isOver, setNodeRef } = useDroppable({ id: collection.id })
  const count = collection.templateIds.length
  const showCountTile = count > 3
  const visibleImages = showCountTile
    ? collection.templateIds.slice(0, 3)
    : collection.templateIds.slice(0, 4)
  const remainingCount = count - 3

  return (
    <Tooltip
      title={
        isOver && collection.isPublished
          ? 'Published \u2014 templates locked'
          : ''
      }
      open={isOver && collection.isPublished}
      arrow
      placement="top"
    >
    <Card
      ref={setNodeRef}
      variant="outlined"
      sx={{
        backgroundColor: collection.backgroundColor,
        borderColor: isOver
          ? collection.isPublished
            ? 'text.disabled'
            : 'primary.main'
          : 'rgba(0,0,0,0.08)',
        borderWidth: isOver ? 2 : 1,
        borderStyle: isOver ? 'dashed' : 'solid',
        transition: 'border-color 0.2s ease',
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <CardActionArea
        onClick={() => onOpen(collection.id)}
        aria-label={`open ${collection.title}`}
      >
        {/* Image mosaic */}
        <Box sx={{ position: 'relative' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '1fr 1fr',
            gap: '2px',
            aspectRatio: `${COLLECTION_CARD_MOSAIC_RATIO}`,
            overflow: 'hidden',
            borderRadius: '8px 8px 0 0',
            backgroundColor: 'rgba(0,0,0,0.06)'
          }}
        >
          {[0, 1, 2, 3].map((i) => {
            // 4th slot becomes a count tile when there are 4+ templates
            if (i === 3 && showCountTile) {
              return (
                <Box
                  key="count"
                  sx={{
                    width: '100%',
                    height: '100%',
                    bgcolor: 'rgba(0,0,0,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ fontWeight: 700 }}
                  >
                    +{remainingCount}
                  </Typography>
                </Box>
              )
            }

            const tmpl =
              visibleImages[i] != null
                ? getTemplateById(visibleImages[i])
                : null
            return tmpl != null ? (
              <Box
                key={tmpl.id}
                component="img"
                src={tmpl.imageUrl}
                alt={tmpl.title}
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Box
                key={i}
                sx={{
                  width: '100%',
                  height: '100%',
                  bgcolor: 'rgba(0,0,0,0.04)'
                }}
              />
            )
          })}
        </Box>
        {/* Drop overlay */}
        {isOver && !collection.isPublished && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.45)',
              borderRadius: '8px 8px 0 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none'
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ color: 'white', fontWeight: 600 }}
            >
              Drop here
            </Typography>
          </Box>
        )}
        </Box>
        {/* Info */}
        <Box sx={{ p: 1.5, height: COLLECTION_CARD_INFO_HEIGHT }}>
          <Typography variant="subtitle2" noWrap>
            {collection.title}
          </Typography>
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            sx={{ mt: 0.5 }}
          >
            <Chip
              size="small"
              label={collection.isPublished ? 'Published' : 'Draft'}
              onClick={(e) => {
                e.stopPropagation()
                onTogglePublish(collection.id)
              }}
              aria-label={`toggle publish for ${collection.title}`}
              sx={{
                fontSize: 11,
                height: 22,
                cursor: 'pointer',
                backgroundColor: collection.isPublished
                  ? 'success.light'
                  : 'action.selected',
                color: collection.isPublished
                  ? 'success.dark'
                  : 'text.secondary',
                '& .MuiChip-label': { px: 1 }
              }}
            />
          </Stack>
        </Box>
      </CardActionArea>
    </Card>
    </Tooltip>
  )
}
