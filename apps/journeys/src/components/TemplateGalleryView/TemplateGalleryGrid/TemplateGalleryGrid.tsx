import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import { GetTemplateGalleryPage_templateGalleryPageBySlug_templates as GalleryTemplate } from '../../../../__generated__/GetTemplateGalleryPage'

import { GalleryTemplateCard } from './GalleryTemplateCard'

interface TemplateGalleryGridProps {
  templates: readonly GalleryTemplate[]
  buildHref: (template: GalleryTemplate) => string
}

export function TemplateGalleryGrid({
  templates,
  buildHref
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
        <Box
          key={template.id}
          sx={{
            flex: '0 0 auto',
            width: { xs: 220, sm: 240, md: 260 },
            scrollSnapAlign: 'start'
          }}
        >
          <GalleryTemplateCard
            template={template}
            href={buildHref(template)}
            priority={index < 3}
          />
        </Box>
      ))}
    </Box>
  )
}
