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

/**
 * How the card is drawn:
 * - `overlay` — portrait image with the title overlaid (mobile grid)
 * - `panel`   — an elevated surface: image, then captioned text and actions
 *   (desktop grid)
 */
type CardVariant = 'overlay' | 'panel'

interface JourneyViewCardProps {
  item: PublicGalleryPageItem
  priority?: boolean
  variant?: CardVariant
  /** Render the action buttons as non-interactive look-alikes (admin preview). */
  decorative?: boolean
}

const OVERLAY_GRADIENT =
  'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0) 100%)'

export function JourneyViewCard({
  item,
  priority = false,
  variant = 'overlay',
  decorative = false
}: JourneyViewCardProps): ReactElement {
  const meta = metaLine(item)

  const imageSrc = item.image?.src ?? null
  const imageAlt = item.image?.alt ?? item.title

  const hasDescription = item.description != null && item.description !== ''

  const imageContent =
    imageSrc != null ? (
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        priority={priority}
        sizes="(max-width: 600px) 60vw, (max-width: 900px) 40vw, 320px"
        style={{ objectFit: 'cover' }}
      />
    ) : (
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{ position: 'absolute', inset: 0 }}
      >
        <InsertPhotoRoundedIcon
          sx={{ fontSize: 56, color: 'rgba(0, 0, 0, 0.25)' }}
        />
      </Stack>
    )

  // Same `overline` variant used by FeaturedRow's meta, just with the More
  // section's smaller default size and tighter letter-spacing. Both grid
  // variants share this so the panel/overlay cards align.
  const eyebrow =
    meta !== '' ? (
      <Typography
        variant="overline"
        sx={{
          color: 'text.secondary',
          fontWeight: 700,
          letterSpacing: '0.08em'
        }}
      >
        {meta}
      </Typography>
    ) : null

  // ── Panel: elevated surface with image, caption and actions ───────────
  if (variant === 'panel') {
    return (
      <Stack
        data-testid="GalleryTemplateCard"
        sx={{
          width: '100%',
          height: '100%',
          borderRadius: GALLERY_CARD_RADIUS,
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
          border: '1px solid rgba(0,0,0,0.1)',
          // No hover lift in the decorative (admin preview) rendering.
          ...(!decorative && {
            transition: 'box-shadow 0.2s ease, transform 0.2s ease',
            '&:hover': {
              boxShadow: '0 14px 34px rgba(0,0,0,0.12)',
              transform: 'translateY(-4px)',
              borderColor: 'transparent'
            }
          })
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 10',
            backgroundColor: '#ECECEC'
          }}
        >
          {imageContent}
        </Box>
        <Stack spacing={1} sx={{ p: 2.5, flex: 1 }}>
          {eyebrow}
          <Typography
            sx={{ fontWeight: 700, fontSize: '1.0625rem', lineHeight: 1.3 }}
          >
            {item.title}
          </Typography>
          {hasDescription && (
            <Typography
              variant="body2"
              // Same `body2` description font as the overlay variant — pick
              // a fixed two-line clamp so cards in a row finish at the same
              // height regardless of how much text each item carries.
              sx={{ color: 'text.secondary', ...clampLines(2) }}
            >
              {item.description}
            </Typography>
          )}
          <Box sx={{ pt: 1, mt: 'auto' }}>
            <JourneyViewCardActions
              itemId={item.id}
              itemTitle={item.title}
              accent={GALLERY_ACCENT}
              fullWidth
              decorative={decorative}
            />
          </Box>
        </Stack>
      </Stack>
    )
  }

  // ── Overlay (default): portrait image with the title overlaid ─────────
  return (
    <Stack
      data-testid="GalleryTemplateCard"
      spacing={1.5}
      sx={{ width: '100%' }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          aspectRatio: '3 / 5',
          borderRadius: GALLERY_CARD_RADIUS,
          overflow: 'hidden',
          backgroundColor: '#ECECEC',
          color: 'common.white'
        }}
      >
        {imageContent}

        <Box
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            p: 2.5,
            pt: 5,
            background: OVERLAY_GRADIENT
          }}
        >
          <Stack spacing={0.75}>
            {meta !== '' && (
              <Typography
                variant="overline"
                sx={{
                  color: 'rgba(255,255,255,0.85)',
                  fontWeight: 700,
                  letterSpacing: '0.08em'
                }}
              >
                {meta}
              </Typography>
            )}
            <Typography
              sx={{
                color: 'common.white',
                fontWeight: 700,
                // Same 17px / lh 1.3 as the panel variant so the two More
                // grids align in title size, not just description size.
                fontSize: '1.0625rem',
                lineHeight: 1.3,
                ...clampLines(2)
              }}
            >
              {item.title}
            </Typography>
            {hasDescription && (
              <Typography
                variant="body2"
                sx={{ color: 'rgba(255,255,255,0.85)', ...clampLines(2) }}
              >
                {item.description}
              </Typography>
            )}
          </Stack>
        </Box>
      </Box>

      <JourneyViewCardActions
        itemId={item.id}
        itemTitle={item.title}
        accent={GALLERY_ACCENT}
        fullWidth
        decorative={decorative}
      />
    </Stack>
  )
}
