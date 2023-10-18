import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import { ReactElement, ReactNode, useMemo } from 'react'
import { SwiperOptions } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

import { GetTags_tags as Tag } from '../../../../__generated__/GetTags'
import { useTagsQuery } from '../../../libs/useTagsQuery'

import { getSortedTags } from './getSortedTags'
import { ParentTagIcon } from './ParentTagIcon'
import { TagItem } from './TagItem'

interface TemplateTagsProps {
  tags?: Tag[]
}

export function TemplateTags({ tags }: TemplateTagsProps): ReactElement {
  const { parentTags } = useTagsQuery()
  const sortedTags = useMemo(
    () => getSortedTags(tags, parentTags),
    [tags, parentTags]
  )
  const tagItems = sortedTags?.map((tag) => ({
    id: tag.id,
    name: tag.name[0].value,
    icon: (
      <ParentTagIcon
        name={
          parentTags?.find((parentTag) => parentTag.id === tag.parentId)
            ?.name[0].value
        }
      />
    )
  }))

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
