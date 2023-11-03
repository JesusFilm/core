import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Stack from '@mui/material/Stack'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { ReactElement, useCallback, useMemo } from 'react'
import { SwiperOptions } from 'swiper'

import { NextImage } from '@core/shared/ui/NextImage'

import { GetTags_tags as Tag } from '../../../../__generated__/GetTags'
import { useTagsQuery } from '../../../libs/useTagsQuery'
import { TemplateGalleryCarousel } from '../TemplateGalleryCarousel'

import acceptanceImage from './assets/acceptance.png'
import depressionImage from './assets/depression.png'
import fearAnxietyImage from './assets/fearAnxiety.png'
import forgivenessImage from './assets/forgiveness.png'
import hopeImage from './assets/hope.png'
import jesusFilmImage from './assets/jesusFilm.png'
import lonelinessImage from './assets/loneliness.png'
import loveImage from './assets/love.png'
import nuaImage from './assets/nua.png'
import securityImage from './assets/security.png'
import significanceImage from './assets/significance.png'

const StyledFeltNeedsButton = styled(ButtonBase)(() => ({
  backgroundColor: 'grey',
  padding: '32px 28px',
  color: 'white',
  borderRadius: '8px'
}))

const StyledCollectionButton = styled(ButtonBase)(() => ({
  borderRadius: '8px'
}))

// TODO: move FeltNeedsButton and CollectionButton to their own folders

interface TagCarouselsProps {
  onChange: (value: string) => void
}

export function TagCarousels({ onChange }: TagCarouselsProps): ReactElement {
  const theme = useTheme()
  const { parentTags, childTags } = useTagsQuery()
  const { breakpoints } = useTheme()

  const swiperBreakpoints: SwiperOptions['breakpoints'] = {
    [breakpoints.values.xs]: {
      slidesPerGroup: 1,
      slidesPerView: 'auto',
      spaceBetween: 20
    },
    [breakpoints.values.md]: {
      slidesPerGroup: 3.8,
      slidesPerView: 3.8,
      spaceBetween: 20
    },
    [breakpoints.values.lg]: {
      slidesPerGroup: 5,
      slidesPerView: 5,
      spaceBetween: 20
    }
  }

  const feltNeedsTagId = useMemo(() => {
    return parentTags.find((tag) => tag.name[0].value === 'Felt Needs')?.id
  }, [parentTags])

  const feltNeedsTags = useMemo(() => {
    return feltNeedsTagId != null
      ? childTags.filter((tag) => tag.parentId === feltNeedsTagId)
      : []
  }, [childTags, feltNeedsTagId])

  // split out felt needs and collection to their own folders and functions
  const tagImage = useCallback((tagLabel: string) => {
    switch (tagLabel) {
      case 'Acceptance':
        return acceptanceImage
      case 'Depression':
        return depressionImage
      case 'Fear/Anxiety':
        return fearAnxietyImage
      case 'Forgiveness':
        return forgivenessImage
      case 'Hope':
        return hopeImage
      case 'Loneliness':
        return lonelinessImage
      case 'Love':
        return loveImage
      case 'Security':
        return securityImage
      case 'Significance':
        return significanceImage
      case 'Jesus Film':
        return jesusFilmImage
      case 'NUA':
        return nuaImage
      default:
        return undefined
    }
  }, [])

  const collectionTagId = useMemo(() => {
    return parentTags.find((tag) => tag.name[0].value === 'Collections')?.id
  }, [parentTags])

  const collectionTags = useMemo(() => {
    return collectionTagId != null
      ? childTags.filter((tag) => tag.parentId === collectionTagId)
      : []
  }, [childTags, collectionTagId])

  const FeltNeedsButton = ({ item: tag, index }): ReactElement => {
    const tagLabel: string =
      tag.name[0].value ?? `felt-needs-${index as string}`
    const image = tagImage(tagLabel)

    return (
      <StyledFeltNeedsButton
        key={`${tagLabel}-button}`}
        sx={{
          width: { xs: '150px', md: '100%' },
          height: { xs: '56px', md: '110px' }
        }}
        onClick={() => onChange(tag.id)}
      >
        {image != null && (
          <NextImage src={image.src} layout="fill" sx={{ borderRadius: 2 }} />
        )}
        <Typography
          variant="h3"
          sx={{ zIndex: 1, display: { xs: 'none', md: 'flex' } }}
        >
          {tagLabel}
        </Typography>
        <Typography
          variant="subtitle2"
          sx={{ zIndex: 1, display: { md: 'none' } }}
        >
          {tagLabel}
        </Typography>
      </StyledFeltNeedsButton>
    )
  }

  const CollectionButton = ({
    tag
  }: {
    tag: Tag & { parentId: string }
  }): ReactElement => {
    const tagLabel: string = tag.name[0]?.value ?? ''
    const image = tagImage(tagLabel)
    return (
      <StyledCollectionButton onClick={() => onChange(tag.id)}>
        <Stack
          gap={3}
          alignItems="center"
          sx={{ [theme.breakpoints.up('md')]: { flexDirection: 'row' } }}
        >
          <Box
            sx={{
              position: 'relative',
              backgroundColor: 'grey',
              height: '64px',
              width: '64px',
              color: 'white',
              borderRadius: 8
            }}
          >
            {image != null && (
              <NextImage
                src={image.src}
                layout="fill"
                sx={{ borderRadius: 8 }}
              />
            )}
          </Box>
          <Typography
            variant="subtitle2"
            sx={{ display: { xs: 'none', md: 'block' } }}
          >
            {tag.name[0].value}
          </Typography>
          <Typography
            variant="subtitle3"
            sx={{ display: { xs: 'block', md: 'none' } }}
          >
            {tag.name[0].value}
          </Typography>
        </Stack>
      </StyledCollectionButton>
    )
  }

  return (
    <Stack gap={7} sx={{ mb: { xs: 10, md: 16 } }}>
      <TemplateGalleryCarousel
        items={feltNeedsTags}
        renderItem={(itemProps) => <FeltNeedsButton {...itemProps} />}
        breakpoints={swiperBreakpoints}
      />
      <Stack direction="row" gap={10}>
        {collectionTags.map((tag, index) => (
          <CollectionButton key={index} tag={tag} />
        ))}
      </Stack>
    </Stack>
  )
}
