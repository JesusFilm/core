import Grid from '@mui/material/Grid'
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
    <Grid
      container
      spacing={3}
      data-testid="TemplateGalleryGrid"
      columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
    >
      {templates.map((template, index) => (
        <Grid key={template.id} size={1}>
          <GalleryTemplateCard
            template={template}
            href={buildHref(template)}
            priority={index < 4}
          />
        </Grid>
      ))}
    </Grid>
  )
}
