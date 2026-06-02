import InsertPhotoRoundedIcon from '@mui/icons-material/InsertPhotoRounded'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { ReactElement } from 'react'

import {
  GALLERY_ACCENT,
  GALLERY_CARD_RADIUS,
  PublicGalleryPageItem
} from '../galleryTokens'

import { metaLine } from './JourneyViewCard'
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
  imagePosition
}: {
  item: PublicGalleryPageItem
  imagePosition: 'left' | 'right'
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
              itemTitle={item.title}
              accent={GALLERY_ACCENT}
            />
          </Box>
        </Stack>
      </ScrollReveal>
    </Stack>
  )
}
