import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { GetTemplateGalleryPage_templateGalleryPageBySlug as TemplateGalleryPage } from '../../../__generated__/GetTemplateGalleryPage'

import { TemplateGalleryEmptyState } from './TemplateGalleryEmptyState'
import { TemplateGalleryGrid } from './TemplateGalleryGrid'
import { TemplateGalleryHeader } from './TemplateGalleryHeader'
import { TemplateGalleryMedia } from './TemplateGalleryMedia'

interface TemplateGalleryViewProps {
  gallery: TemplateGalleryPage
}

export function TemplateGalleryView({
  gallery
}: TemplateGalleryViewProps): ReactElement {
  const hasTemplates = gallery.templates.length > 0
  const hasMedia = gallery.mediaUrl != null && gallery.mediaUrl !== ''

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      <Stack spacing={{ xs: 4, md: 6 }}>
        <TemplateGalleryHeader gallery={gallery} />
        {hasTemplates && <TemplateGalleryGrid templates={gallery.templates} />}
        {!hasTemplates && !hasMedia && <TemplateGalleryEmptyState />}
        <TemplateGalleryMedia mediaUrl={gallery.mediaUrl} />
      </Stack>
    </Container>
  )
}
