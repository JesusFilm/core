import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { PublicGalleryPageData } from '../PublicGalleryPage'

import { responsiveValue } from './galleryTokens'
import { PublicTemplateGalleryCard } from './PublicTemplateGalleryCard'
import { PublicTemplateGalleryEmptyState } from './PublicTemplateGalleryEmptyState'
import { PublicTemplateGalleryHeader } from './PublicTemplateGalleryHeader'
import { PublicTemplateGalleryMedia } from './PublicTemplateGalleryMedia'

interface PublicTemplateGalleryProps {
  data: PublicGalleryPageData
  /**
   * `'public'` renders the responsive desktop↔mobile layout. `'admin'` forces
   * the compact (mobile) layout regardless of viewport, for the admin preview.
   */
  variant?: 'public' | 'admin'
}

// Backdrop the white "paper" floats on (desktop only — the paper goes full
// width on mobile/admin, covering it). Diagonal pastel wash running from a
// grayish-blue at the bottom-left to a warm cream at the top-right (the Figma
// stops), under a faint static-noise texture so the card reads as a distinct,
// shadowed surface rather than sitting on a plain white page.
const BACKDROP_GRADIENT =
  'linear-gradient(to top right, #DCE9EE 0%, #DCE9EE 40%, #FFEDF1 50%, #FFF1E0 60%, #FFF1E0 100%)'
const BACKDROP_NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='m'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23m)'/%3E%3C/svg%3E\")"

export function PublicTemplateGallery({
  data,
  variant = 'public'
}: PublicTemplateGalleryProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')

  const compact = variant === 'admin'
  const hasItems = data.items.length > 0
  const hasMedia = data.mediaUrl != null && data.mediaUrl !== ''

  return (
    <Box
      data-testid="PublicTemplateGallery"
      sx={{
        position: 'relative',
        minHeight: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        background: compact ? '#FFFFFF' : BACKDROP_GRADIENT,
        p: responsiveValue(compact, 0, 11),
        // Static-noise texture over the gradient (desktop only).
        ...(compact
          ? {}
          : {
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                backgroundImage: BACKDROP_NOISE,
                backgroundSize: '180px 180px',
                opacity: 0.36,
                mixBlendMode: 'multiply',
                pointerEvents: 'none'
              }
            })
      }}
    >
      <Stack
        spacing={responsiveValue(compact, 6, 7)}
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: responsiveValue<string | number>(compact, '100%', 937),
          p: responsiveValue(compact, 5, 12),
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: responsiveValue(compact, 0, 3),
          boxShadow: responsiveValue(
            compact,
            'none',
            '0px 24px 38px rgba(0,0,0,0.14), 0px 9px 46px rgba(0,0,0,0.12), 0px 11px 15px rgba(0,0,0,0.2)'
          )
        }}
      >
        <PublicTemplateGalleryHeader
          title={data.title}
          description={data.description}
          creatorName={data.creatorName}
          creatorImageSrc={data.creatorImageSrc}
          creatorImageAlt={data.creatorImageAlt}
          compact={compact}
        />

        {hasItems ? (
          <Stack
            direction="row"
            spacing={3}
            role="list"
            aria-label={t('Templates')}
            sx={{
              alignItems: 'stretch',
              // Bleed the scroll track to the paper edges while keeping the
              // first card aligned with the header text (px cancels the
              // negative margin for the leading edge only).
              mx: responsiveValue(compact, -5, -12),
              px: responsiveValue(compact, 5, 12),
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              pb: 2,
              // Hide the scrollbar but keep the area scrollable.
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' }
            }}
          >
            {data.items.map((item, index) => (
              <Box
                key={item.id}
                role="listitem"
                sx={{ display: 'flex', flexShrink: 0 }}
              >
                <PublicTemplateGalleryCard item={item} priority={index === 0} />
              </Box>
            ))}
          </Stack>
        ) : (
          <PublicTemplateGalleryEmptyState />
        )}

        {hasMedia && (
          <PublicTemplateGalleryMedia
            mediaUrl={data.mediaUrl as string}
            compact={compact}
          />
        )}
      </Stack>
    </Box>
  )
}
