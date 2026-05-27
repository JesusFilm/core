import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { ReactElement } from 'react'

import { GALLERY_ACCENT, PublicGalleryPageData } from '../PublicGalleryPage'

import {
  GALLERY_TEXT_PRIMARY,
  GALLERY_TEXT_SECONDARY,
  responsiveValue
} from './galleryTokens'

type PublicTemplateGalleryHeaderProps = Pick<
  PublicGalleryPageData,
  | 'title'
  | 'description'
  | 'creatorName'
  | 'creatorImageSrc'
  | 'creatorImageAlt'
> & {
  /** Force the compact (mobile) layout — used by the admin preview. */
  compact: boolean
}

export function PublicTemplateGalleryHeader({
  title,
  description,
  creatorName,
  creatorImageSrc,
  creatorImageAlt,
  compact
}: PublicTemplateGalleryHeaderProps): ReactElement {
  const hasAvatar = creatorImageSrc != null && creatorImageSrc !== ''
  const avatarAlt = creatorImageAlt ?? creatorName

  return (
    <Stack spacing={responsiveValue(compact, 3, 5)}>
      <Stack spacing={responsiveValue(compact, 3, 5)}>
        <Typography
          variant={compact ? 'h4' : 'h3'}
          component="h1"
          sx={{ color: GALLERY_TEXT_PRIMARY }}
        >
          {title}
        </Typography>
        {description !== '' && (
          <Typography
            variant="body1"
            sx={{ color: GALLERY_TEXT_PRIMARY, whiteSpace: 'pre-wrap' }}
          >
            {description}
          </Typography>
        )}
      </Stack>
      <Stack direction="row" spacing={2} alignItems="center">
        {hasAvatar ? (
          <Box
            sx={{
              position: 'relative',
              width: 32,
              height: 32,
              borderRadius: '50%',
              overflow: 'hidden',
              flexShrink: 0
            }}
          >
            <Image
              src={creatorImageSrc}
              alt={avatarAlt}
              fill
              sizes="32px"
              style={{ objectFit: 'cover' }}
            />
          </Box>
        ) : (
          <Avatar
            sx={{
              width: 32,
              height: 32,
              fontSize: '0.875rem',
              bgcolor: GALLERY_ACCENT
            }}
          >
            {creatorName.charAt(0).toUpperCase()}
          </Avatar>
        )}
        <Typography
          variant="body1"
          sx={{ color: GALLERY_TEXT_SECONDARY, fontWeight: 700 }}
        >
          {creatorName}
        </Typography>
      </Stack>
    </Stack>
  )
}
