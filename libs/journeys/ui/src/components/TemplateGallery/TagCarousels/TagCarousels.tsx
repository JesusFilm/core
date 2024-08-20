import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { ReactElement, useMemo } from 'react'
import { SwiperOptions } from 'swiper/types'

import { useTagsQuery } from '../../../libs/useTagsQuery'
import { ContentCarousel } from '../../ContentCarousel'

import { CollectionButton } from './CollectionButton'
import { FeltNeedsButton } from './FeltNeedsButton'

export function TagCarousels(): ReactElement {
  const { parentTags, childTags, loading } = useTagsQuery()
  const { breakpoints } = useTheme()

  const swiperBreakpoints: SwiperOptions['breakpoints'] = {
    [breakpoints.values.xs]: {
      slidesPerGroup: 1
    },
    [breakpoints.values.md]: {
      slidesPerGroup: 3.5
    },
    [breakpoints.values.lg]: {
      slidesPerGroup: 5
    }
  }

  const feltNeedsTagId = useMemo(() => {
    return parentTags.find((tag) => tag.name[0].value === 'Felt Needs')?.id
  }, [parentTags])

  const feltNeedsTags = useMemo(() => {
    return feltNeedsTagId != null
      ? childTags.filter(
          (tag) =>
            tag.parentId === feltNeedsTagId && hasBgImg(tag.name[0].value)
        )
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
    <Stack
      gap={7}
      sx={{ mb: { xs: 10, md: 16 }, height: { xs: 219, md: 234 } }}
    >
      <ContentCarousel
        items={feltNeedsTags}
        renderItem={(itemProps) => <FeltNeedsButton {...itemProps} />}
        breakpoints={swiperBreakpoints}
        loading={loading}
        cardSpacing={{
          xs: 5,
          md: 5
        }}
        content="felt-needs"
      />
      <Stack direction="row" gap={10} sx={{ ml: -2 }}>
        {loading
          ? [0, 1].map((item, index) => {
              return <CollectionButton key={index} item={undefined} />
            })
          : collectionTags.map((tag, index) => {
              return <CollectionButton key={index} item={tag} />
            })}
      </Stack>
    </Stack>
  )
}

function hasBgImg(tag: string): boolean {
  // Temporary fix: Only display these tags that have background images
  // (images currently hard-coded in FeltNeedsButton)
  return [
    'Depression',
    'Anxiety',
    'Forgiveness',
    'Hope',
    'Loneliness',
    'Love',
    'Security',
    'Significance',
    'Acceptance'
  ].includes(tag)
}
