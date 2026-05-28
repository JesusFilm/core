import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { JourneyViewCard } from '../JourneyView/JourneyViewCard'
import { JourneyViewHeader } from '../JourneyView/JourneyViewHeader'
import { JourneyViewMedia } from '../JourneyView/JourneyViewMedia'
import {
  GALLERY_ACCENT,
  PublicGalleryPageData,
  splitFeatured
} from '../PublicGalleryPage'

interface AdminViewProps {
  data: PublicGalleryPageData
}

// Sections are separated by padding (and the journey's divider border)
// rather than the live page's full-viewport `100svh` bands — the preview
// shows the design without the scroll experience.
const sectionSx = {
  py: 4,
  borderTop: '1px solid',
  borderColor: 'divider'
} as const

function SectionLabel({ children }: { children: string }): ReactElement {
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
      <Box
        sx={{ width: 24, height: 3, borderRadius: 1, bgcolor: GALLERY_ACCENT }}
      />
      <Typography
        variant="overline"
        sx={{ color: GALLERY_ACCENT, fontWeight: 700, letterSpacing: '0.14em' }}
      >
        {children}
      </Typography>
    </Stack>
  )
}

/**
 * Static recreation of the public gallery page for the admin collection
 * dialog. Reuses the journey view's header, cards, and media so the fonts,
 * centering, and spacing match the live page exactly — but lays the
 * sections out with plain padding instead of full-viewport bands, and drops
 * the parallax / scroll-reveal animations. Read-only: cards render their
 * actions decoratively, and the tree is meant to sit behind an `aria-hidden`
 * wrapper supplied by the consumer. Empty fields fall back to placeholder
 * copy so the dialog reads well before the publisher has filled them in.
 */
export function AdminView({ data }: AdminViewProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')

  const hasItems = data.items.length > 0
  const hasMedia = data.mediaUrl != null && data.mediaUrl !== ''
  // Same shared split as the journey view — kept in lockstep via splitFeatured.
  const { featured, rest } = splitFeatured(data.items)

  const headerData = {
    title: data.title !== '' ? data.title : t('Untitled collection'),
    description:
      data.description !== ''
        ? data.description
        : t('A short description of your collection will appear here.'),
    creatorName: data.creatorName !== '' ? data.creatorName : t('Creator name'),
    creatorImageSrc: data.creatorImageSrc,
    creatorImageAlt: data.creatorImageAlt
  }

  return (
    <Box data-testid="PublicGalleryPageAdminView" sx={{ width: '100%' }}>
      <Box sx={{ py: 4 }}>
        <JourneyViewHeader data={headerData} creatorAboveDescription />
      </Box>

      {featured.length > 0 && (
        <Box component="section" sx={sectionSx}>
          <SectionLabel>{t('Explore')}</SectionLabel>
          <Stack spacing={3}>
            {featured.map((item) => (
              <JourneyViewCard
                key={item.id}
                item={item}
                variant="panel"
                decorative
              />
            ))}
          </Stack>
        </Box>
      )}

      {rest.length > 0 && (
        <Box component="section" sx={sectionSx}>
          <SectionLabel>{t('More')}</SectionLabel>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: 'repeat(2, 1fr)'
            }}
          >
            {rest.map((item) => (
              <JourneyViewCard
                key={item.id}
                item={item}
                variant="overlay"
                decorative
              />
            ))}
          </Box>
        </Box>
      )}

      {!hasItems && (
        // Placeholder tiles keep the layout legible before any templates
        // are added.
        <Box component="section" sx={sectionSx}>
          <Stack spacing={3}>
            {[0, 1].map((index) => (
              <Box
                key={`placeholder-${index}`}
                sx={{
                  width: '100%',
                  aspectRatio: '16 / 11',
                  borderRadius: 3,
                  bgcolor: 'action.hover',
                  opacity: 0.6
                }}
              />
            ))}
          </Stack>
        </Box>
      )}

      {hasMedia && (
        <Box component="section" sx={sectionSx}>
          <JourneyViewMedia mediaUrl={data.mediaUrl} />
        </Box>
      )}
    </Box>
  )
}
