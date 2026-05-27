import Box from '@mui/material/Box'
import Image from 'next/image'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { GALLERY_CARD_RADIUS } from '../PublicGalleryPage'

import { responsiveValue } from './galleryTokens'

interface PublicTemplateGalleryMediaProps {
  /** Hero/cover media — an image url or a Strategy embed slug/url. */
  mediaUrl: string
  /** Force the compact (mobile) layout — used by the admin preview. */
  compact: boolean
}

function isImageUrl(mediaUrl: string): boolean {
  return (
    /\.(png|jpe?g|webp|gif|avif)(\?|#|$)/i.test(mediaUrl) ||
    mediaUrl.includes('images.unsplash.com')
  )
}

/**
 * Mirrors the embed-url transform used by StrategySection: Canva links take an
 * `?embed` suffix, Google Slides "pub" links become "embed" links. Anything
 * else is embedded as-is.
 */
function toEmbedUrl(mediaUrl: string): string {
  if (mediaUrl.includes('canva')) {
    // Append the embed flag without clobbering any existing query string.
    const separator = mediaUrl.includes('?') ? '&' : '?'
    return `${mediaUrl}${separator}embed`
  }
  return mediaUrl.replace('pub?start', 'embed?start')
}

export function PublicTemplateGalleryMedia({
  mediaUrl,
  compact
}: PublicTemplateGalleryMediaProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  const image = isImageUrl(mediaUrl)

  return (
    <Box
      data-testid="PublicTemplateGalleryMedia"
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: '841 / 470',
        overflow: 'hidden',
        backgroundColor: '#ECECEC',
        borderRadius: responsiveValue(compact, 2, GALLERY_CARD_RADIUS),
        border: '1px solid rgba(0, 0, 0, 0.08)'
      }}
    >
      {image ? (
        <Image
          src={mediaUrl}
          alt=""
          fill
          sizes="(max-width: 900px) 100vw, 841px"
          style={{ objectFit: 'cover' }}
        />
      ) : (
        <Box
          component="iframe"
          data-testid="PublicTemplateGalleryMediaFrame"
          loading="lazy"
          src={toEmbedUrl(mediaUrl)}
          allow="fullscreen"
          allowFullScreen
          title={t('Gallery media')}
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            border: 'none'
          }}
        />
      )}
    </Box>
  )
}
