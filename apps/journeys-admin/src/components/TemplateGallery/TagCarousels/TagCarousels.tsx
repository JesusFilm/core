import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { ReactElement, useMemo } from 'react'
import { SwiperOptions } from 'swiper'

import { useTagsQuery } from '../../../libs/useTagsQuery'
import { TemplateGalleryCarousel } from '../TemplateGalleryCarousel'

import { CollectionButton } from './CollectionButton'
import { FeltNeedsButton } from './FeltNeedsButton'

interface TagCarouselsProps {
  selectedTagIds: string[]
  onChange: (selectedTagId: string) => void
}

export function TagCarousels({
  selectedTagIds,
  onChange: handleChange
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
      <TemplateGalleryCarousel
        items={
          loading
            ? [
                {
                  id: '1',
                  name: [
                    {
                      __typename: 'Translation',
                      value: 'Acceptance',
                      primary: true
                    }
                  ]
                },
                {
                  id: '2',
                  name: [
                    {
                      __typename: 'Translation',
                      value: 'Depression',
                      primary: true
                    }
                  ]
                },
                {
                  id: '3',
                  name: [
                    {
                      __typename: 'Translation',
                      value: 'Fear/Anxiety',
                      primary: true
                    }
                  ]
                },
                {
                  id: '4',
                  name: [
                    {
                      __typename: 'Translation',
                      value: 'Forgiveness',
                      primary: true
                    }
                  ]
                },
                {
                  id: '5',
                  name: [
                    { __typename: 'Translation', value: 'Hope', primary: true }
                  ]
                },
                {
                  id: '6',
                  name: [
                    {
                      __typename: 'Translation',
                      value: 'Loneliness',
                      primary: true
                    }
                  ]
                },
                {
                  id: '7',
                  name: [
                    { __typename: 'Translation', value: 'Love', primary: true }
                  ]
                },
                {
                  id: '8',
                  name: [
                    {
                      __typename: 'Translation',
                      value: 'Security',
                      primary: true
                    }
                  ]
                },
                {
                  id: '9',
                  name: [
                    {
                      __typename: 'Translation',
                      value: 'Significance',
                      primary: true
                    }
                  ]
                }
              ]
            : feltNeedsTags
        }
        renderItem={(itemProps) => (
          <FeltNeedsButton {...itemProps} onClick={handleChange} />
        )}
        breakpoints={swiperBreakpoints}
        loading={loading}
        loadingSpacing={{
          xs: 5,
          md: 5
        }}
      />
      <Stack direction="row" gap={10} sx={{ ml: -2 }}>
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
