import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import { GetTemplateGalleryPage_templateGalleryPageBySlug_templates as GalleryTemplate } from '../../../../__generated__/GetTemplateGalleryPage'
import { useGalleryStyle } from '../GalleryStyleContext'

import { bentoLayout } from './bentoLayout'
import { GalleryTemplateCard } from './GalleryTemplateCard'

interface TemplateGalleryGridProps {
  templates: readonly GalleryTemplate[]
}

const scrollSx = {
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
} as const

const panelGridSx = {
  display: 'grid',
  gap: { xs: 3, md: 4 },
  gridTemplateColumns: {
    xs: '1fr',
    sm: 'repeat(2, 1fr)',
    md: 'repeat(3, 1fr)'
  }
} as const

export function TemplateGalleryGrid({
  templates
}: TemplateGalleryGridProps): ReactElement {
  const style = useGalleryStyle()

  // Bento: `bentoLayout` packs the tiles into full-width bands so the grid
  // always fills a clean rectangle (flush bottom) while the tiles stay varied
  // rectangles. We pack separately per breakpoint (mobile is 2 columns), and
  // keep the default `grid-auto-flow: row` so the bands lay out in order.
  if (style.layout === 'bento') {
    const desktopColumns = templates.length <= 4 ? 3 : 4
    const desktopSpans = bentoLayout(templates.length, desktopColumns)
    const mobileSpans = bentoLayout(templates.length, 2)
    return (
      <Box
        data-testid="TemplateGalleryGrid"
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            md: `repeat(${desktopColumns}, 1fr)`
          },
          gridAutoRows: { xs: 150, md: 200 }
        }}
      >
        {templates.map((template, index) => (
          <Box
            key={template.id}
            sx={{
              gridColumn: {
                xs: `span ${mobileSpans[index].col}`,
                md: `span ${desktopSpans[index].col}`
              },
              gridRow: {
                xs: `span ${mobileSpans[index].row}`,
                md: `span ${desktopSpans[index].row}`
              }
            }}
          >
            <GalleryTemplateCard template={template} priority={index < 3} />
          </Box>
        ))}
      </Box>
    )
  }

  const containerSx =
    style.layout === 'landing' || style.layout === 'rows'
      ? panelGridSx
      : scrollSx

  return (
    <Box data-testid="TemplateGalleryGrid" sx={containerSx}>
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
