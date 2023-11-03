import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { ReactElement, useMemo } from 'react'
import { SwiperOptions } from 'swiper'

import { useTagsQuery } from '../../../libs/useTagsQuery'
import { TemplateGalleryCarousel } from '../TemplateGalleryCarousel'

import { CollectionButton } from './CollectionButton'
import { FeltNeedsButton } from './FeltNeedsButton'

interface TagCarouselsProps {
  onChange: (value: string) => void
}

export function TagCarousels({ onChange }: TagCarouselsProps): ReactElement {
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

  const collectionTagId = useMemo(() => {
    return parentTags.find((tag) => tag.name[0].value === 'Collections')?.id
  }, [parentTags])

  const collectionTags = useMemo(() => {
    return collectionTagId != null
      ? childTags.filter((tag) => tag.parentId === collectionTagId)
      : []
  }, [childTags, collectionTagId])

  return (
    <Stack gap={7} sx={{ mb: { xs: 10, md: 16 } }}>
      <TemplateGalleryCarousel
        items={feltNeedsTags}
        renderItem={(itemProps) => (
          <FeltNeedsButton {...itemProps} onChange={onChange} />
        )}
        breakpoints={swiperBreakpoints}
      />
      <Stack direction="row" gap={10}>
        {collectionTags.map((tag, index) => (
          <CollectionButton key={index} tag={tag} onChange={onChange} />
        ))}
      </Stack>
    </Stack>
  )
}
