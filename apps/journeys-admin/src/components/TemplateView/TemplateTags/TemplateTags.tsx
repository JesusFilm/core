import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import { ReactElement, ReactNode, useMemo } from 'react'
import { SwiperOptions } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

import { JourneyFields_tags as Tag } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import { useTagsQuery } from '../../../libs/useTagsQuery'

import { getParentTagsWithIcon } from './getParentTagsWithIcon'
import { getSortedTags } from './getSortedTags'
import { TagItem } from './TagItem'

interface TemplateTagsProps {
  tags?: Tag[]
}

export function TemplateTags({ tags }: TemplateTagsProps): ReactElement {
  const { parentTags } = useTagsQuery()
  const parentTagsWithIcons = useMemo(
    () => getParentTagsWithIcon(parentTags),
    [parentTags]
  )
  const sortedTags = useMemo(
    () => getSortedTags(tags, parentTags),
    [tags, parentTags]
  )
  const tagItems = sortedTags?.map((tag) => {
    return {
      id: tag.id,
      name: tag.name[0].value,
      icon: parentTagsWithIcons.find(
        (parentTag) => parentTag.id === tag.parentId || tag.id === parentTag.id
      )?.icon
    }
  })

  return (
    <>
      {tagItems != null ? (
        tagItems.length > 0 && (
          <SwiperWrapper>
            {tagItems.map(({ id, name, icon }, index) => (
              <SwiperSlide key={id} style={{ width: 'fit-content', zIndex: 2 }}>
                <TagItem
                  key={id}
                  name={name}
                  icon={icon}
                  showDivider={index < tagItems.length - 1}
                />
              </SwiperSlide>
            ))}
          </SwiperWrapper>
        )
      ) : (
        <SwiperWrapper>
          {[0, 1, 2].map((item, index, array) => (
            <SwiperSlide key={item} style={{ width: '128px', zIndex: 2 }}>
              <TagItem loading showDivider={index < array.length - 1} />
            </SwiperSlide>
          ))}
        </SwiperWrapper>
      )}
    </>
  )
}

interface SwiperWrapperProps {
  children: ReactNode
}

function SwiperWrapper({ children }: SwiperWrapperProps): ReactElement {
  const { breakpoints } = useTheme()
  const swiperBreakpoints: SwiperOptions['breakpoints'] = {
    [breakpoints.values.sm]: {
      spaceBetween: 37
    }
  }
  return (
    <Box>
      <Swiper
        data-testid="TemplateTags"
        freeMode
        watchOverflow
        slidesPerView="auto"
        spaceBetween={8}
        breakpoints={swiperBreakpoints}
        mousewheel
        autoHeight
        style={{
          overflow: 'visible',
          zIndex: 2
        }}
      >
        {children}
      </Swiper>
    </Box>
  )
}
