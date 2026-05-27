import InsertPhotoRoundedIcon from '@mui/icons-material/InsertPhotoRounded'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, ReactNode, RefObject, useEffect, useRef } from 'react'

import {
  GALLERY_ACCENT,
  GALLERY_CARD_RADIUS,
  PublicGalleryPageData,
  PublicGalleryPageItem
} from '../PublicGalleryPage'

import { JourneyViewCard, metaLine } from './JourneyViewCard'
import { JourneyViewCardActions } from './JourneyViewCardActions'
import { JourneyViewEmptyState } from './JourneyViewEmptyState'
import { JourneyViewHeader } from './JourneyViewHeader'
import { JourneyViewMedia } from './JourneyViewMedia'
import { ScrollReveal } from './ScrollReveal'

interface JourneyViewProps {
  data: PublicGalleryPageData
}

const FEATURED_COUNT = 2

// A faint band tint that reads on any theme (light or dark) without
// committing to a colour.
const bandBackground = (theme: { palette: { mode: string } }): string =>
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

/**
 * Viewport-relative parallax that closes the gap between sections as you
 * scroll: the leaving (upper) section lags — scrolling slower — while the
 * arriving (lower) section is pulled up toward it, so neighbouring sections
 * draw together as a boundary crosses the viewport. Strength is the peak
 * offset as a fraction of the viewport height, lighter on mobile (xs/sm)
 * than on desktop. Offset is 0 when centred, so each section reads normally
 * when it's the focus.
 */
function useParallax(
  desktopStrength = 0.06,
  mobileStrength = 0.03
): RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement>(null)
  const { breakpoints } = useTheme()
  const mobileMaxWidth = breakpoints.values.md

  useEffect(() => {
    const element = ref.current
    if (element == null) return
    if (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return

    let frame = 0
    const update = (): void => {
      frame = 0
      const viewport = window.innerHeight || 1
      // xs/sm get the gentler drift; md+ the full strength.
      const strength =
        window.innerWidth < mobileMaxWidth ? mobileStrength : desktopStrength
      const rect = element.getBoundingClientRect()
      // -1 (well above the viewport) … 0 (centred) … 1 (well below)
      const progress = (rect.top + rect.height / 2 - viewport / 2) / viewport
      const clamped = Math.max(-1, Math.min(1, progress))
      // Negative sign: below-centre content lifts (catches up to the section
      // above) and above-centre content sinks (lags), shrinking the gap.
      element.style.transform = `translateY(${(-clamped * strength * viewport).toFixed(1)}px)`
    }
    const onScroll = (): void => {
      if (frame === 0) frame = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    update()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame !== 0) cancelAnimationFrame(frame)
    }
  }, [desktopStrength, mobileStrength, mobileMaxWidth])
  return ref
}

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

function FeaturedRow({
  item,
  imagePosition,
  priority
}: {
  item: PublicGalleryPageItem
  imagePosition: 'left' | 'right'
  priority: boolean
}): ReactElement {
  const meta = metaLine(item)
  const hasDescription = item.description != null && item.description !== ''
  const imageSrc = item.image?.src ?? null
  const imageAlt = item.image?.alt ?? item.title

  // Picture animates in from its own side first, then the text from the
  // opposite side a beat later.
  const imageFrom = imagePosition === 'left' ? 'left' : 'right'
  const textFrom = imagePosition === 'left' ? 'right' : 'left'

  return (
    <Stack
      direction={{
        xs: 'column',
        md: imagePosition === 'right' ? 'row-reverse' : 'row'
      }}
      spacing={{ xs: 3, md: 6 }}
      sx={{ alignItems: { md: 'center' } }}
    >
      <ScrollReveal
        from={imageFrom}
        sx={{ width: '100%', flex: { md: '1 1 56%' } }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            aspectRatio: '3 / 2',
            borderRadius: GALLERY_CARD_RADIUS,
            overflow: 'hidden',
            backgroundColor: '#ECECEC'
          }}
        >
          {imageSrc != null ? (
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              priority={priority}
              sizes="(max-width: 900px) 100vw, 600px"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <Stack
              alignItems="center"
              justifyContent="center"
              sx={{ position: 'absolute', inset: 0 }}
            >
              <InsertPhotoRoundedIcon
                sx={{ fontSize: 56, color: 'rgba(0,0,0,0.25)' }}
              />
            </Stack>
          )}
        </Box>
      </ScrollReveal>
      <ScrollReveal
        from={textFrom}
        delay={180}
        sx={{ width: '100%', flex: { md: '1 1 44%' } }}
      >
        <Stack spacing={2}>
          {meta !== '' && (
            <Typography
              variant="overline"
              sx={{
                color: GALLERY_ACCENT,
                fontWeight: 700,
                letterSpacing: '0.12em'
              }}
            >
              {meta}
            </Typography>
          )}
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {item.title}
          </Typography>
          {hasDescription && (
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {item.description}
            </Typography>
          )}
          <Box sx={{ pt: 1 }}>
            <JourneyViewCardActions
              itemId={item.id}
              itemSlug={item.slug}
              accent={GALLERY_ACCENT}
            />
          </Box>
        </Stack>
      </ScrollReveal>
    </Stack>
  )
}

export function JourneyView({ data }: JourneyViewProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  const introRef = useParallax()
  const featuredRef = useParallax()
  const restRef = useParallax()

  // Feature the first two templates by default. With exactly three, feature
  // all three so the complete set isn't left showing a single, bare card.
  // From four onward the default holds, so the complete set always has at
  // least two cards.
  const featuredCount = data.items.length === 3 ? 3 : FEATURED_COUNT
  const featured = data.items.slice(0, featuredCount)
  const rest = data.items.slice(featuredCount)
  const hasTemplates = data.items.length > 0
  const hasMedia = data.mediaUrl != null && data.mediaUrl !== ''

  return (
    <Box data-testid="TemplateGallerySections">
      {/* Section 1 — intro (title, description, author) with a parallax drift */}
      <Box
        component="section"
        sx={{ ...fullHeightSection, py: { xs: 8, md: 14 } }}
      >
        <Container maxWidth="md">
          <Box ref={introRef} sx={{ willChange: 'transform' }}>
            <JourneyViewHeader data={data} creatorAboveDescription />
          </Box>
        </Container>
      </Box>

      {/* Section 2 — the featured templates (two, or three when that's all) */}
      {featured.length > 0 && (
        <Box
          component="section"
          sx={{
            ...fullHeightSection,
            py: { xs: 9, md: 13 },
            borderTop: '1px solid',
            borderColor: 'divider',
            backgroundColor: bandBackground
          }}
        >
          <Container maxWidth="lg">
            <Box ref={featuredRef} sx={{ willChange: 'transform' }}>
              <SectionLabel>{t('Featured')}</SectionLabel>
              <Stack spacing={{ xs: 9, md: 13 }} sx={{ mt: 2 }}>
                {featured.map((item, index) => (
                  <FeaturedRow
                    key={item.id}
                    item={item}
                    imagePosition={index % 2 === 0 ? 'left' : 'right'}
                    priority={index < 2}
                  />
                ))}
              </Stack>
            </Box>
          </Container>
        </Box>
      )}

      {/* Section 3 — the rest of the templates */}
      {rest.length > 0 && (
        <Box
          component="section"
          sx={{
            ...fullHeightSection,
            py: { xs: 9, md: 13 },
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Container maxWidth="lg">
            <Box ref={restRef} sx={{ willChange: 'transform' }}>
              <SectionLabel>{t('The complete set')}</SectionLabel>
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
          sx={{
            ...fullHeightSection,
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
