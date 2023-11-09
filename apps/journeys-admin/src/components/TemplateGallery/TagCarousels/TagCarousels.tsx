import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import compact from 'lodash/compact'
import difference from 'lodash/difference'
import { ReactElement, useMemo } from 'react'
import { SwiperOptions } from 'swiper/types'

import { useTagsQuery } from '../../../libs/useTagsQuery'
import { TemplateGalleryCarousel } from '../TemplateGalleryCarousel'

import { CollectionButton } from './CollectionButton'
import { FeltNeedsButton } from './FeltNeedsButton'

interface TagCarouselsProps {
  selectedTagIds: string[]
  onChange: (selectedTagIds: string[], availableTagIds: string[]) => void
}

export function TagCarousels({
  selectedTagIds,
  onChange
}: TagCarouselsProps): ReactElement {
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
      ? childTags.filter((tag) => tag.parentId === feltNeedsTagId)
      : []
  }, [childTags, feltNeedsTagId])
  const feltNeedsTagIds = useMemo(
    () => feltNeedsTags.map(({ id }) => id),
    [feltNeedsTags]
  )

  const collectionTagId = useMemo(() => {
    return parentTags.find((tag) => tag.name[0].value === 'Collections')?.id
  }, [parentTags])

  const collectionTags = useMemo(() => {
    return collectionTagId != null
      ? childTags.filter((tag) => tag.parentId === collectionTagId)
      : []
  }, [childTags, collectionTagId])
  const collectionTagIds = useMemo(
    () => collectionTags.map(({ id }) => id),
    [collectionTags]
  )

  const handleChange = (selectedTagId: string): void => {
    const carouselsTagIds = [...feltNeedsTagIds, ...collectionTagIds] ?? []

    // Existing selected tag ids from these carousels only
    const carouselSelectedTagIds = compact(
      selectedTagIds.map((tagId) => carouselsTagIds.find((id) => id === tagId))
    )
    // Remove newly selected tag id from existing tag ids
    const existingTagIds = difference(carouselSelectedTagIds, [selectedTagId])

    onChange([...existingTagIds, selectedTagId], carouselsTagIds)
  }

  return (
    <Stack gap={7} sx={{ mb: { xs: 10, md: 16 } }}>
      <TemplateGalleryCarousel
        items={feltNeedsTags}
        renderItem={(itemProps) => (
          <FeltNeedsButton {...itemProps} onClick={handleChange} />
        )}
        breakpoints={swiperBreakpoints}
        loading={loading}
      />
      <Stack direction="row" gap={10}>
        {loading
          ? [0, 1].map((item, index) => {
              return (
                <CollectionButton
                  key={index}
                  item={undefined}
                  onClick={handleChange}
                />
              )
            })
          : collectionTags.map((tag, index) => {
              return (
                <CollectionButton
                  key={index}
                  item={tag}
                  onClick={handleChange}
                />
              )
            })}
      </Stack>
    </Stack>
  )
}
