import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import { GetTemplateGalleryPage_templateGalleryPageBySlug_templates as GalleryTemplate } from '../../../../__generated__/GetTemplateGalleryPage'

import { GalleryTemplateCard } from './GalleryTemplateCard'

interface TemplateGalleryGridProps {
  templates: readonly GalleryTemplate[]
}

export function TemplateGalleryGrid({
  templates
}: TemplateGalleryGridProps): ReactElement {
  return (
    <Box
      data-testid="TemplateGalleryGrid"
      sx={{
        display: 'flex',
        gap: 3,
        overflowX: 'auto',
        overflowY: 'hidden',
        scrollSnapType: 'x mandatory',
        pb: 2,
        '&::-webkit-scrollbar': { height: 8 },
        '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0,0,0,0.2)',
          borderRadius: 4
        },
        '&::-webkit-scrollbar-thumb:hover': {
          backgroundColor: 'rgba(0,0,0,0.35)'
        }
      }}
    >
      {templates.map((template, index) => (
        <GalleryTemplateCard
          key={template.id}
          template={template}
          priority={index < 3}
        />
      ))}
    </Box>
  )
}
