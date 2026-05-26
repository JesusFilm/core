import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import { GetTemplateGalleryPage_templateGalleryPageBySlug as TemplateGalleryPage } from '../../../__generated__/GetTemplateGalleryPage'

import { TemplateGallerySections } from './TemplateGallerySections'

interface TemplateGalleryViewProps {
  gallery: TemplateGalleryPage
}

export function TemplateGalleryView({
  gallery
}: TemplateGalleryViewProps): ReactElement {
  return (
    <Box sx={{ minHeight: '100dvh' }}>
      <TemplateGallerySections gallery={gallery} />
    </Box>
  )
}
