import Avatar from '@mui/material/Avatar'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { GetTemplateGalleryPage_templateGalleryPageBySlug as TemplateGalleryPage } from '../../../../__generated__/GetTemplateGalleryPage'
import { GALLERY_ACCENT } from '../galleryTheme'

interface TemplateGalleryHeaderProps {
  gallery: Pick<
    TemplateGalleryPage,
    | 'title'
    | 'description'
    | 'creatorName'
    | 'creatorImageSrc'
    | 'creatorImageAlt'
  >
  /** Place the creator between the title and description instead of last. */
  creatorAboveDescription?: boolean
}

export function TemplateGalleryHeader({
  gallery,
  creatorAboveDescription = false
}: TemplateGalleryHeaderProps): ReactElement {
  const { t } = useTranslation('apps-journeys')

  const hasCreatorImage =
    gallery.creatorImageSrc != null && gallery.creatorImageSrc !== ''
  const hasCreatorName = gallery.creatorName !== ''
  const showCreator = hasCreatorImage || hasCreatorName

  const descriptionNode =
    gallery.description !== '' ? (
      <Typography
        variant="body1"
        sx={{
          color: 'text.secondary',
          whiteSpace: 'pre-wrap',
          maxWidth: 620,
          // Extra breathing room above the description on mobile when the
          // author sits between it and the title.
          ...(creatorAboveDescription && { pt: { xs: 3, md: 0 } })
        }}
      >
        {gallery.description}
      </Typography>
    ) : null

  const creatorNode = showCreator ? (
    <Stack direction="row" spacing={1.5} alignItems="center">
      {hasCreatorImage && (
        <Avatar
          src={gallery.creatorImageSrc ?? undefined}
          alt={
            gallery.creatorImageAlt != null && gallery.creatorImageAlt !== ''
              ? gallery.creatorImageAlt
              : gallery.creatorName
          }
          sx={{ width: 44, height: 44 }}
        />
      )}
      {hasCreatorName && (
        <Typography variant="subtitle2">{gallery.creatorName}</Typography>
      )}
    </Stack>
  ) : null

  return (
    <Stack
      spacing={2.5}
      data-testid="TemplateGalleryHeader"
      alignItems="center"
      sx={{ textAlign: 'center' }}
    >
      <Typography
        variant="overline"
        sx={{ color: GALLERY_ACCENT, fontWeight: 700, letterSpacing: '0.12em' }}
      >
        {t('Collection')}
      </Typography>
      <Typography
        variant="h2"
        component="h1"
        sx={(theme) => ({
          // Smaller on mobile (xs/sm); keep the variant's native size on md+.
          fontSize: {
            xs: '2.125rem',
            sm: '2.5rem',
            md: theme.typography.h2.fontSize
          }
        })}
      >
        {gallery.title}
      </Typography>
      {creatorAboveDescription && creatorNode}
      {descriptionNode}
      {!creatorAboveDescription && creatorNode}
    </Stack>
  )
}
