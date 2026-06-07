import Avatar from '@mui/material/Avatar'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { GALLERY_ACCENT, PublicGalleryPageData } from '../galleryTokens'

type JourneyViewHeaderData = Pick<
  PublicGalleryPageData,
  | 'title'
  | 'description'
  | 'creatorName'
  | 'creatorImageSrc'
  | 'creatorImageAlt'
>

interface JourneyViewHeaderProps {
  data: JourneyViewHeaderData
  /** Place the creator between the title and description instead of last. */
  creatorAboveDescription?: boolean
}

export function JourneyViewHeader({
  data,
  creatorAboveDescription = false
}: JourneyViewHeaderProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')

  const hasCreatorImage =
    data.creatorImageSrc != null && data.creatorImageSrc !== ''
  const hasCreatorName = data.creatorName !== ''
  const showCreator = hasCreatorImage || hasCreatorName

  const descriptionNode =
    data.description !== '' ? (
      <Typography
        variant="body1"
        sx={{
          color: 'text.secondary',
          whiteSpace: 'pre-wrap',
          maxWidth: 620,
          // The header Stack centres the block on the page; inside the
          // block we left-align so long descriptions read as paragraph
          // copy instead of a centred ribbon that gets harder to follow
          // line by line.
          textAlign: 'left',
          // Extra breathing room above the description on mobile when the
          // author sits between it and the title.
          ...(creatorAboveDescription && { pt: { xs: 3, md: 0 } })
        }}
      >
        {data.description}
      </Typography>
    ) : null

  const creatorNode = showCreator ? (
    <Stack direction="row" spacing={1.5} alignItems="center">
      {hasCreatorImage && (
        <Avatar
          src={data.creatorImageSrc ?? undefined}
          alt={
            data.creatorImageAlt != null && data.creatorImageAlt !== ''
              ? data.creatorImageAlt
              : data.creatorName
          }
          sx={{ width: 44, height: 44 }}
        />
      )}
      {hasCreatorName && (
        <Typography variant="subtitle2">{data.creatorName}</Typography>
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
        {data.title}
      </Typography>
      {creatorAboveDescription && creatorNode}
      {descriptionNode}
      {!creatorAboveDescription && creatorNode}
    </Stack>
  )
}
