import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement, useMemo } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'

import { JourneyFields_tags as Tag } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'
import Laptop1Icon from '@core/shared/ui/icons/Laptop1'

import { useTagsQuery } from '../../../libs/useTagsQuery'

import { getParentTagsWithIcon } from './getParentTagsWithIcon'
import { TagItem } from './TagItem'

interface TemplateTagsProps {
  tags?: Tag[]
}

export function TemplateTags({ tags }: TemplateTagsProps): ReactElement {
  const { parentTags } = useTagsQuery()
  const smUp = useMediaQuery((theme: Theme) => theme?.breakpoints?.up('sm'))
  const parentTagsWithIcons = useMemo(
    () => getParentTagsWithIcon(parentTags),
    [parentTags]
  )

  const tagItems = tags?.map((tag) => {
    return {
      id: tag.id,
      name: tag.name[0].value,
      icon: parentTagsWithIcons.find(
        (parentTag) => parentTag.id === tag.parentId || tag.id === parentTag.id
      )?.icon ?? <Laptop1Icon />
    }
  })

  return tagItems != null && tagItems?.length > 0 ? (
    <Swiper
      data-testid="TemplateTags"
      freeMode
      watchOverflow
      slidesPerView="auto"
      spaceBetween={smUp ? 37 : 8}
      mousewheel
      style={{
        overflow: 'visible',
        marginLeft: smUp ? '-32px' : '-44px',
        marginRight: smUp ? '-36px' : '-44px',
        paddingLeft: smUp ? '32px' : '44px',
        paddingRight: smUp ? '40px' : '70px',
        paddingTop: '8px',
        paddingBottom: '8px',
        height: '93px',
        zIndex: 2
      }}
    >
      {tagItems.map(({ id, name, icon }, index) => (
        <SwiperSlide
          key={id}
          style={{ flexShrink: 1, display: 'flex', alignContent: 'center' }}
        >
          <TagItem
            key={id}
            name={name}
            icon={icon}
            showDivider={index < tagItems.length - 1}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  ) : (
    <></>
  )
}
