import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

export interface TemplateCardTemplate {
  id: string
  title: string
  primaryImageBlock: { src: string | null; alt: string } | null
}

export interface TemplateCardProps {
  template: TemplateCardTemplate
  isDragOverlay?: boolean
}

export function TemplateCard({
  template,
  isDragOverlay
}: TemplateCardProps): ReactElement {
  const imageSrc = template.primaryImageBlock?.src ?? null
  return (
    <Card
      data-testid={`TemplateCard-${template.id}`}
      sx={{
        width: '100%',
        cursor: isDragOverlay === true ? 'grabbing' : 'grab',
        boxShadow: isDragOverlay === true ? 6 : 1,
        transform: isDragOverlay === true ? 'rotate(2deg)' : undefined
      }}
    >
      {imageSrc != null && (
        <CardMedia
          component="img"
          height="100"
          image={imageSrc}
          alt={template.primaryImageBlock?.alt ?? template.title}
        />
      )}
      <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
        <Typography
          variant="subtitle2"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {template.title}
        </Typography>
      </CardContent>
    </Card>
  )
}
