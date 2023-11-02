import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Stack from '@mui/material/Stack'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { ReactElement, useCallback, useMemo } from 'react'
import { SwiperOptions } from 'swiper'

import { NextImage } from '@core/shared/ui/NextImage'

import { useTagsQuery } from '../../../libs/useTagsQuery'
import { TemplateGalleryCarousel } from '../TemplateGalleryCarousel'

import acceptanceImage from './assets/acceptance.png'
import depressionImage from './assets/depression.png'
import fearAnxietyImage from './assets/fearAnxiety.png'

const StyledFeltNeedsButton = styled(ButtonBase)(({ theme }) => ({
  backgroundColor: 'grey',
  padding: '32px 28px',
  color: 'white',
  borderRadius: '8px'
}))

export function TagCarousels(): ReactElement {
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

  const tagImage = useCallback((tagLabel: string) => {
    switch (tagLabel) {
      case 'Acceptance':
        return acceptanceImage
      case 'Depression':
        return depressionImage
      case 'Fear/Anxiety':
        return fearAnxietyImage
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

  return (
    <Stack gap={7} sx={{ mb: { xs: 10, md: 16 } }}>
      <TemplateGalleryCarousel
        items={feltNeedsTags}
        renderItem={(itemProps) => <FeltNeedsButton {...itemProps} />}
        breakpoints={swiperBreakpoints}
      />
      <Stack direction="row" gap={10}>
        {collectionTags.map((tag) => (
          <Stack
            direction="row"
            key={`${tag.name[0].value}-button`}
            gap={3}
            alignItems="center"
          >
            <Box
              sx={{
                backgroundColor: 'grey',
                height: '64px',
                width: '64px',
                color: 'white',
                borderRadius: 8
              }}
            />
            <Typography variant="subtitle2">{tag.name[0].value}</Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  )
}
