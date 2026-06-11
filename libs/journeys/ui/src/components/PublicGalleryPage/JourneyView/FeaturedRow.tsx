import InsertPhotoRoundedIcon from '@mui/icons-material/InsertPhotoRounded'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { ReactElement } from 'react'

import {
  GALLERY_ACCENT,
  GALLERY_CARD_RADIUS,
  PublicGalleryPageItem,
  clampLines,
  metaLine
} from '../galleryTokens'

import { JourneyViewCardActions } from './JourneyViewCardActions'
import { ScrollReveal } from './ScrollReveal'

/**
 * One featured-template row in the live page's "Explore" section:
 * a large image on one side, the title/description/actions on the other.
 * Alternates left/right per row via the `imagePosition` prop, and uses
 * `ScrollReveal` so the image animates in from its own side and the text
 * follows a beat later from the opposite side.
 */
export function FeaturedRow({
  item,
  imagePosition,
  priority = false,
  decorative = false
}: {
  item: PublicGalleryPageItem
  imagePosition: 'left' | 'right'
  /**
   * Hint to `next/image` for above-the-fold priority loading; reserved for
   * the very first featured row (cover is text-only, so the first featured
   * image is the closest thing to a hero on this page).
   */
  priority?: boolean
  /**
   * Render as a static, non-interactive preview — skips the reveal-on-
   * scroll choreography and disables the card-action links. Used by the
   * admin collection-edit preview so it shares the live layout without
   * the animation/interaction surface.
   */
  decorative?: boolean
}): ReactElement {
  const meta = metaLine(item)
  const hasDescription = item.description != null && item.description !== ''
  const imageSrc = item.image?.src ?? null
  const imageAlt = item.image?.alt ?? item.title

  // Picture animates in from its own side first, then the text from the
  // opposite side a beat later.
  const imageFrom = imagePosition === 'left' ? 'left' : 'right'
  const textFrom = imagePosition === 'left' ? 'right' : 'left'

  // The live row goes side-by-side at md+. In decorative use (admin preview)
  // we force the stacked xs layout regardless of viewport: MUI's responsive
  // `sx` keys off the viewport, not the container, so the ~287px preview
  // pane inside an md+ browser would otherwise resolve to the side-by-side
  // form and squish both image and text into half-widths.
  return (
    <Stack
      direction={
        decorative
          ? 'column'
          : {
              xs: 'column',
              md: imagePosition === 'right' ? 'row-reverse' : 'row'
            }
      }
      spacing={decorative ? 3 : { xs: 3, md: 6 }}
      sx={decorative ? undefined : { alignItems: { md: 'center' } }}
    >
      <ScrollReveal
        from={imageFrom}
        disabled={decorative}
        sx={{
          width: '100%',
          ...(decorative ? {} : { flex: { md: '1 1 56%' } })
        }}
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
        disabled={decorative}
        sx={{
          width: '100%',
          ...(decorative ? {} : { flex: { md: '1 1 44%' } })
        }}
      >
        <Stack spacing={2}>
          {meta !== '' && (
            <Typography
              variant="overline"
              sx={{
                color: GALLERY_ACCENT,
                fontWeight: 700,
                // Bumped up so the Explore meta reads bigger than the More
                // grid's meta (which uses the variant's default 10px),
                // matching the broader Explore > More size hierarchy.
                fontSize: '0.75rem',
                letterSpacing: '0.12em'
              }}
            >
              {meta}
            </Typography>
          )}
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {item.title}
          </Typography>
          {hasDescription && (
            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                // Long descriptions otherwise dominate the row; cap to three
                // lines and let Preview show the full text on the template
                // page. Shared `clampLines` recipe so the Explore row and
                // the More cards can't drift on the same `-webkit-line-clamp`.
                ...clampLines(3)
              }}
            >
              {item.description}
            </Typography>
          )}
          <Box sx={{ pt: 1 }}>
            <JourneyViewCardActions
              itemId={item.id}
              itemTitle={item.title}
              itemSlug={item.slug}
              fullWidth="responsive"
              decorative={decorative}
            />
          </Box>
        </Stack>
      </ScrollReveal>
    </Stack>
  )
}
