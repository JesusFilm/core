import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import {
  GetTemplateGalleryPage_templateGalleryPageBySlug_templates as GalleryTemplate,
  GetTemplateGalleryPage_templateGalleryPageBySlug as TemplateGalleryPage
} from '../../../__generated__/GetTemplateGalleryPage'

import { TemplateGalleryEmptyState } from './TemplateGalleryEmptyState'
import { TemplateGalleryGrid } from './TemplateGalleryGrid'
import { TemplateGalleryHeader } from './TemplateGalleryHeader'
import { TemplateGalleryMedia } from './TemplateGalleryMedia'

interface TemplateGalleryViewProps {
  gallery: TemplateGalleryPage
  buildTemplateHref: (template: GalleryTemplate) => string
}

export function TemplateGalleryView({
  gallery,
  buildTemplateHref
}: TemplateGalleryViewProps): ReactElement {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      <Stack spacing={{ xs: 4, md: 6 }}>
        <TemplateGalleryHeader gallery={gallery} />
        {gallery.templates.length > 0 ? (
          <TemplateGalleryGrid
            templates={gallery.templates}
            buildHref={buildTemplateHref}
          />
        ) : (
          <TemplateGalleryEmptyState />
        )}
        <TemplateGalleryMedia mediaUrl={gallery.mediaUrl} />
      </Stack>
    </Container>
  )
}
