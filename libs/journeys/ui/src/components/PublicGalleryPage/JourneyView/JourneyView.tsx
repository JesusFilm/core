import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import { Theme, lighten } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, ReactNode, useMemo } from 'react'

import {
  GALLERY_ACCENT,
  PublicGalleryPageData,
  splitFeatured
} from '../galleryTokens'

import { FeaturedRow } from './FeaturedRow'
import { JourneyViewCard } from './JourneyViewCard'
import { JourneyViewEmptyState } from './JourneyViewEmptyState'
import { JourneyViewHeader } from './JourneyViewHeader'
import { JourneyViewMedia } from './JourneyViewMedia'
import {
  GALLERY_NAV_HEIGHT,
  JourneyViewNav,
  JourneyViewNavSection,
  scrollToSection
} from './JourneyViewNav'
import { ScrollProvider } from './scrollContext'
import { ScrollReveal } from './ScrollReveal'
import { useParallax } from './useParallax'

interface JourneyViewProps {
  data: PublicGalleryPageData
}

// Stable ids the fixed nav scrolls to and the scrollspy observes.
const SECTION_IDS = {
  cover: 'gallery-cover',
  featured: 'gallery-featured',
  set: 'gallery-set',
  media: 'gallery-media'
} as const

// A faint band tint that reads on any theme (light or dark) without
// committing to a colour.
const bandBackground = (theme: Theme): string =>
  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)'

// Each section is at least one viewport tall: short content centres in the
// viewport; taller content grows the section (min-height, not fixed) so it
// simply scrolls through to its end before the next section begins. `svh`
// (small viewport height) keeps a section within the visible area on mobile
// even while the browser chrome is showing, avoiding an awkward overflow.
const fullHeightSection = {
  minHeight: '100svh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center'
} as const

function SectionLabel({ children }: { children: ReactNode }): ReactElement {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
      <Box
        sx={{
          width: 28,
          height: 3,
          borderRadius: 1,
          backgroundColor: GALLERY_ACCENT
        }}
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

export function JourneyView({ data }: JourneyViewProps): ReactElement {
  // The ScrollProvider gives `useParallax` (×3) and `JourneyViewNav`'s
  // border-fade one shared scroll listener instead of four.
  return (
    <ScrollProvider>
      <JourneyViewBody data={data} />
    </ScrollProvider>
  )
}

function JourneyViewBody({ data }: JourneyViewProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  // -- no early returns above the useParallax calls --
  // Each useParallax(...) runs several hooks internally; introducing a
  // conditional `return` in between would shift their order between
  // renders and break the rules of hooks.
  // The cover carries the CTA, so its drift is halved (half the default
  // strength) to keep the movement subtle there; the other sections keep the
  // standard parallax.
  const introRef = useParallax(0.03, 0.015)
  const featuredRef = useParallax()
  const restRef = useParallax()

  // The split rule (feature all three when there are exactly three) lives in
  // the shared module so this view and the AdminView preview can't drift.
  const { featured, rest } = splitFeatured(data.items)
  const hasTemplates = data.items.length > 0
  const hasMedia = data.mediaUrl != null && data.mediaUrl !== ''

  // Nav links mirror the sections that actually render, in scroll order, and
  // reuse each section's own label. The cover is always first — so there's
  // always at least one section — and the template sections follow based on
  // how many templates (and whether media) the collection has.
  const navSections = useMemo<JourneyViewNavSection[]>(() => {
    // The cover uses a static label, not the collection title: a long title
    // stretches the desktop nav row and looks unbalanced. The full title is
    // still the hero of the cover section.
    const sections: JourneyViewNavSection[] = [
      { id: SECTION_IDS.cover, label: t('Overview') }
    ]
    if (featured.length > 0)
      sections.push({ id: SECTION_IDS.featured, label: t('Explore') })
    if (rest.length > 0)
      sections.push({ id: SECTION_IDS.set, label: t('More') })
    if (hasMedia) sections.push({ id: SECTION_IDS.media, label: t('Strategy') })
    return sections
  }, [featured.length, rest.length, hasMedia, t])

  return (
    <Box data-testid="TemplateGallerySections">
      <JourneyViewNav
        sections={navSections}
        ariaLabel={t('Gallery sections')}
      />
      {/* Section 1 — intro/cover (title, description, author) with a parallax
          drift; the nav's first, always-present section. */}
      <Box
        component="section"
        id={SECTION_IDS.cover}
        sx={{
          minHeight: '100svh',
          display: 'flex',
          flexDirection: 'column',
          scrollMarginTop: { xs: 0, md: `${GALLERY_NAV_HEIGHT}px` },
          pt: { xs: 8, md: 14 },
          pb: { xs: 5, md: 8 }
        }}
      >
        {/* The header centres in the available height; the CTA follows it in
            normal flow, so the gap between them is guaranteed and never
            collapses on short screens. */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <Container maxWidth="md">
            <Box ref={introRef}>
              <JourneyViewHeader data={data} creatorAboveDescription />
            </Box>
          </Container>
        </Box>
        {/* A standing call to action at the foot of the cover: it both invites
            the visitor in and points to the templates below. The top padding
            sets the minimum distance from the header above — wide enough that
            the header's parallax drift (up to ~6% of the viewport) never pushes
            the text under the button. */}
        {hasTemplates && (
          <Box
            sx={{
              flexShrink: 0,
              display: 'flex',
              justifyContent: 'center',
              px: 2,
              pt: { xs: 10, md: 14 }
            }}
          >
            <Button
              variant="contained"
              onClick={() => scrollToSection(SECTION_IDS.featured)}
              endIcon={<KeyboardArrowDownRoundedIcon />}
              data-testid="GalleryCoverCta"
              sx={{
                backgroundColor: GALLERY_ACCENT,
                color: '#FFFFFF',
                borderRadius: 999,
                px: 3,
                py: 1.25,
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': { backgroundColor: lighten(GALLERY_ACCENT, 0.15) }
              }}
            >
              {t('Explore')}
            </Button>
          </Box>
        )}
      </Box>

      {/* Section 2 — the featured templates (two, or three when that's all) */}
      {featured.length > 0 && (
        <Box
          component="section"
          id={SECTION_IDS.featured}
          sx={{
            ...fullHeightSection,
            scrollMarginTop: { xs: 0, md: `${GALLERY_NAV_HEIGHT}px` },
            py: { xs: 9, md: 13 },
            borderTop: '1px solid',
            borderColor: 'divider',
            backgroundColor: bandBackground
          }}
        >
          <Container maxWidth="lg">
            <Box ref={featuredRef}>
              <SectionLabel>{t('Explore')}</SectionLabel>
              <Stack spacing={{ xs: 9, md: 13 }} sx={{ mt: 2 }}>
                {featured.map((item, index) => (
                  <FeaturedRow
                    key={item.id}
                    item={item}
                    imagePosition={index % 2 === 0 ? 'left' : 'right'}
                    priority={index === 0}
                  />
                ))}
              </Stack>
            </Box>
          </Container>
        </Box>
      )}

      {/* Section 3 — the rest of the templates. Top-aligned (not centred) so a
          sparse set's cards sit near the top edge — the same position they take
          when the set is long enough to overflow the viewport. This keeps the
          leading whitespace small, so the cards are visible as soon as you
          scroll in and signal there's more to see. */}
      {rest.length > 0 && (
        <Box
          component="section"
          id={SECTION_IDS.set}
          sx={{
            ...fullHeightSection,
            justifyContent: 'flex-start',
            scrollMarginTop: { xs: 0, md: `${GALLERY_NAV_HEIGHT}px` },
            py: { xs: 9, md: 13 },
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Container maxWidth="lg">
            <Box ref={restRef}>
              <SectionLabel>{t('More')}</SectionLabel>
              {/* Mobile (xs/sm): portrait overlay cards, two per row */}
              <Box
                sx={{
                  display: { xs: 'grid', md: 'none' },
                  mt: 2,
                  gap: 2,
                  gridTemplateColumns: 'repeat(2, 1fr)'
                }}
              >
                {rest.map((item, index) => (
                  <ScrollReveal
                    key={item.id}
                    from="up"
                    delay={Math.min(index, 5) * 70}
                  >
                    <JourneyViewCard item={item} variant="overlay" />
                  </ScrollReveal>
                ))}
              </Box>
              {/* Desktop (md+): elevated panel cards, three per row */}
              <Box
                sx={{
                  display: { xs: 'none', md: 'grid' },
                  mt: 2,
                  gap: 4,
                  gridTemplateColumns: 'repeat(3, 1fr)'
                }}
              >
                {rest.map((item, index) => (
                  <ScrollReveal
                    key={item.id}
                    from="up"
                    delay={Math.min(index, 5) * 70}
                    sx={{ height: '100%' }}
                  >
                    <JourneyViewCard item={item} variant="panel" />
                  </ScrollReveal>
                ))}
              </Box>
            </Box>
          </Container>
        </Box>
      )}

      {!hasTemplates && (
        <Container maxWidth="lg" sx={{ py: 10 }}>
          <JourneyViewEmptyState />
        </Container>
      )}

      {hasMedia && (
        <Box
          component="section"
          id={SECTION_IDS.media}
          sx={{
            ...fullHeightSection,
            scrollMarginTop: { xs: 0, md: `${GALLERY_NAV_HEIGHT}px` },
            py: { xs: 8, md: 12 },
            borderTop: '1px solid',
            borderColor: 'divider',
            backgroundColor: bandBackground
          }}
        >
          <Container maxWidth="lg">
            <JourneyViewMedia mediaUrl={data.mediaUrl} />
          </Container>
        </Box>
      )}
    </Box>
  )
}
