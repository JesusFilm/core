import { useDraggable } from '@dnd-kit/core'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import type { MockTemplate } from './mockData'

interface MockTemplateCardProps {
  template: MockTemplate
  isDragOverlay?: boolean
}

function CardVisual({ template }: { template: MockTemplate }): ReactElement {
  return (
    <>
      <Box
        sx={{
          position: 'relative',
          width: 'auto',
          aspectRatio: '1.43',
          mx: 1.75,
          mt: 1.75,
          borderRadius: '8px',
          overflow: 'hidden',
          bgcolor: 'rgba(0, 0, 0, 0.06)'
        }}
      >
        <Box
          component="img"
          src={template.imageUrl}
          alt={template.title}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
        />
        <Chip
          label={template.languageCode}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            fontSize: 10,
            height: 22
          }}
        />
      </Box>
      <CardContent sx={{ pl: 2.5, pr: 2, pt: 1, pb: 2 }}>
        <Typography
          variant="subtitle2"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {template.title}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            mt: 0.5
          }}
        >
          {template.description}
        </Typography>
      </CardContent>
    </>
  )
}

export function MockTemplateCard({
  template,
  isDragOverlay = false
}: MockTemplateCardProps): ReactElement {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: template.id
  })

  if (isDragOverlay) {
    return (
      <Card
        variant="outlined"
        sx={{
          borderColor: 'divider',
          cursor: 'grabbing',
          boxShadow: 8,
          transform: 'rotate(2deg)',
          maxWidth: 280
        }}
      >
        <CardVisual template={template} />
      </Card>
    )
  }

  return (
    <Card
      ref={setNodeRef}
      variant="outlined"
      {...attributes}
      {...listeners}
      sx={{
        borderColor: 'divider',
        cursor: 'grab',
        opacity: isDragging ? 0.3 : 1,
        touchAction: 'none',
        '&:hover': {
          boxShadow: 2
        }
      }}
      aria-label={`template card ${template.title}`}
    >
      <CardVisual template={template} />
    </Card>
  )
}

export { CardVisual }
