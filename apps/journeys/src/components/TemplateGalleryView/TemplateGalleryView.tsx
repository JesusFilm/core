import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import { ReactElement, useState } from 'react'

import { GetTemplateGalleryPage_templateGalleryPageBySlug as TemplateGalleryPage } from '../../../__generated__/GetTemplateGalleryPage'

import { GalleryStyleProvider } from './GalleryStyleContext'
import { galleryStyles } from './galleryStyles'
import { GalleryStyleToggle } from './GalleryStyleToggle'
import { TemplateGalleryEmptyState } from './TemplateGalleryEmptyState'
import { TemplateGalleryGrid } from './TemplateGalleryGrid'
import { GalleryTemplateCard } from './TemplateGalleryGrid/GalleryTemplateCard'
import { TemplateGalleryHeader } from './TemplateGalleryHeader'
import { TemplateGalleryMedia } from './TemplateGalleryMedia'
import { TemplateGallerySections } from './TemplateGallerySections'

interface TemplateGalleryViewProps {
  gallery: TemplateGalleryPage
}

export function TemplateGalleryView({
  gallery
}: TemplateGalleryViewProps): ReactElement {
  const [styleId, setStyleId] = useState(galleryStyles[0].id)
  const style =
    galleryStyles.find(({ id }) => id === styleId) ?? galleryStyles[0]

  const { templates } = gallery
  const hasTemplates = templates.length > 0
  const hasMedia = gallery.mediaUrl != null && gallery.mediaUrl !== ''

  const header = <TemplateGalleryHeader gallery={gallery} />
  const grid = hasTemplates ? (
    <TemplateGalleryGrid templates={templates} />
  ) : null
  const emptyState =
    !hasTemplates && !hasMedia ? <TemplateGalleryEmptyState /> : null
  const media = <TemplateGalleryMedia mediaUrl={gallery.mediaUrl} />

  let body: ReactElement

  if (style.layout === 'hero' && hasTemplates) {
    // Spotlight: first template featured large, the remainder scroll below.
    const [featured, ...rest] = templates
    body = (
      <Stack spacing={{ xs: 4, md: 6 }}>
        {header}
        <GalleryTemplateCard template={featured} variant="hero" priority />
        {rest.length > 0 && <TemplateGalleryGrid templates={rest} />}
        {media}
      </Stack>
    )
  } else if (style.layout === 'rows' && hasTemplates) {
    // Feature rows: the first few templates as alternating image/text rows,
    // then the remainder in a grid so a large collection doesn't run on.
    const FEATURE_ROW_COUNT = 3
    const featured = templates.slice(0, FEATURE_ROW_COUNT)
    const rest = templates.slice(FEATURE_ROW_COUNT)
    body = (
      <Stack spacing={{ xs: 6, md: 10 }}>
        {header}
        {featured.map((template, index) => (
          <GalleryTemplateCard
            key={template.id}
            template={template}
            variant="hero"
            imagePosition={index % 2 === 0 ? 'left' : 'right'}
            priority={index < 2}
          />
        ))}
        {rest.length > 0 && <TemplateGalleryGrid templates={rest} />}
        {media}
      </Stack>
    )
  } else if (style.layout === 'landing') {
    body = (
      <Stack spacing={{ xs: 6, md: 8 }}>
        {header}
        {grid}
        {emptyState}
        {media}
      </Stack>
    )
  } else {
    // Showcase (scroll) and any fallback: header on top, cards below.
    body = (
      <Stack spacing={{ xs: 4, md: 6 }}>
        {header}
        {grid}
        {emptyState}
        {media}
      </Stack>
    )
  }

  return (
    <GalleryStyleProvider value={style}>
      <Box
        sx={[
          { transition: 'background 0.3s ease, color 0.3s ease' },
          style.pageSx
        ]}
      >
        {/* Prototype-only: pick a layout preset to preview the page. */}
        <GalleryStyleToggle value={styleId} onChange={setStyleId} />
        {style.layout === 'sections' ? (
          // Sections runs full-bleed so its bands can span the viewport.
          <TemplateGallerySections gallery={gallery} />
        ) : (
          <Container
            maxWidth={style.containerMaxWidth}
            sx={{ py: { xs: 4, md: 8 } }}
          >
            {body}
          </Container>
        )}
      </Box>
    </GalleryStyleProvider>
  )
}
