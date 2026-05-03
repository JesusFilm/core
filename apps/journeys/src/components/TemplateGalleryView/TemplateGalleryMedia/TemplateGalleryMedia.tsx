import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import { toEmbedUrl } from './toEmbedUrl'

interface TemplateGalleryMediaProps {
  mediaUrl: string | null
  title: string
}

export function TemplateGalleryMedia({
  mediaUrl,
  title
}: TemplateGalleryMediaProps): ReactElement | null {
  if (mediaUrl == null || mediaUrl === '') return null

  const embedUrl = toEmbedUrl(mediaUrl)
  if (embedUrl == null) return null

  return (
    <Box
      data-testid="TemplateGalleryMedia"
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 9',
        borderRadius: 2,
        overflow: 'hidden',
        backgroundColor: 'common.black'
      }}
    >
      <Box
        component="iframe"
        src={embedUrl}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none'
        }}
      />
    </Box>
  )
}
