import Avatar from '@mui/material/Avatar'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { GetTemplateGalleryPage_templateGalleryPageBySlug as TemplateGalleryPage } from '../../../../__generated__/GetTemplateGalleryPage'

interface TemplateGalleryHeaderProps {
  gallery: Pick<
    TemplateGalleryPage,
    | 'title'
    | 'description'
    | 'creatorName'
    | 'creatorImageSrc'
    | 'creatorImageAlt'
  >
}

export function TemplateGalleryHeader({
  gallery
}: TemplateGalleryHeaderProps): ReactElement {
  const hasCreatorImage =
    gallery.creatorImageSrc != null && gallery.creatorImageSrc !== ''
  const hasCreatorName = gallery.creatorName !== ''
  const showCreator = hasCreatorImage || hasCreatorName

  return (
    <Stack spacing={3} data-testid="TemplateGalleryHeader">
      <Typography variant="h2" component="h1">
        {gallery.title}
      </Typography>
      {gallery.description !== '' && (
        <Typography variant="body1" color="text.secondary">
          {gallery.description}
        </Typography>
      )}
      {showCreator && (
        <Stack direction="row" spacing={2} alignItems="center">
          {hasCreatorImage && (
            <Avatar
              src={gallery.creatorImageSrc ?? undefined}
              alt={
                gallery.creatorImageAlt != null &&
                gallery.creatorImageAlt !== ''
                  ? gallery.creatorImageAlt
                  : gallery.creatorName
              }
              sx={{ width: 48, height: 48 }}
            />
          )}
          {hasCreatorName && (
            <Typography variant="subtitle2">{gallery.creatorName}</Typography>
          )}
        </Stack>
      )}
    </Stack>
  )
}
