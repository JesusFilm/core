import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { styled, useTheme } from '@mui/material/styles'
import { ReactElement, ReactNode, useMemo } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { SwiperOptions } from 'swiper/types'

import { JourneyFields_tags as Tag } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import { useTagsQuery } from '../../../libs/useTagsQuery'
import { ParentTagIcon } from '../../ParentTagIcon'

import { getSortedTags } from './getSortedTags'
import { TagItem } from './TagItem'

interface TemplateTagsProps {
  tags?: Tag[]
}

const StyledSwiperSlide = styled(SwiperSlide)(() => ({}))

export function TemplateTags({ tags }: TemplateTagsProps): ReactElement {
  const { parentTags } = useTagsQuery()
  const sortedTags = useMemo(
    () => getSortedTags(tags, parentTags),
    [tags, parentTags]
  )

  return (
    <>
      {sortedTags != null ? (
        sortedTags.length > 0 && (
          <SwiperWrapper>
            {sortedTags.map(({ id, name, parentId }, index) => (
              <StyledSwiperSlide
                key={id}
                sx={{ width: 'fit-content', mr: { xs: 2, sm: '37px' } }}
              >
                <TagItem
                  key={id}
                  name={name[0].value}
                  icon={
                    <ParentTagIcon
                      name={
                        parentTags?.find(
                          (parentTag) => parentTag.id === parentId
                        )?.name[0].value
                      }
                    />
                  }
                  showDivider={index < sortedTags.length - 1}
                />
              </StyledSwiperSlide>
            ))}
          </SwiperWrapper>
        )
      ) : (
        <Stack direction="row">
          {[0, 1, 2].map((item, index, array) => (
            <Stack
              key={item}
              sx={{
                width: 'max-content',
                mr: { xs: 2, sm: '37px' }
              }}
            >
              <TagItem loading showDivider={index < array.length - 1} />
            </Stack>
          ))}
        </Stack>
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
        mousewheel={{
          forceToAxis: true
        }}
        autoHeight
        style={{
          overflow: 'visible'
        }}
      >
        {children}
      </Swiper>
    </Box>
  )
}
