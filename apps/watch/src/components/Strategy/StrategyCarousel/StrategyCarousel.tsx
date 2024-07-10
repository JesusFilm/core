import { TemplateGalleryCarousel } from '@core/journeys/ui/TemplateGallery/TemplateGalleryCarousel'
import { useTheme } from '@mui/material/styles'
import { ReactElement } from 'react'
import { SwiperOptions } from 'swiper/types'
import { StrategyItem } from '../StrategyItem'

// use templategallerycarosuel component here
// need items array
// need renderitem function

// items array

const longDescription =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum'

const items = [
  {
    title: 'Title',
    description: longDescription,
    id: 'test-id'
  },
  {
    title: 'Title',
    description: longDescription,
    id: 'test-id'
  },
  {
    title: 'Title',
    description: longDescription,
    id: 'test-id'
  },
  {
    title: 'Title',
    description: longDescription,
    id: 'test-id'
  },
  {
    title: 'Title',
    description: 'description',
    id: 'test-id'
  },
  {
    title: 'Title',
    description: 'description',
    id: 'test-id'
  },
  {
    title: 'Title',
    description: 'description',
    id: 'test-id'
  },
  {
    title: 'Title',
    description: 'description',
    id: 'test-id'
  },
  {
    title: 'Title',
    description: 'description',
    id: 'test-id'
  }
]

export function StrategyCarousel(): ReactElement {
  const { breakpoints } = useTheme()

  const swiperBreakpoints: SwiperOptions['breakpoints'] = {
    [breakpoints.values.xs]: {
      slidesPerGroup: 2,
      spaceBetween: 4
    },
    [breakpoints.values.sm]: {
      slidesPerGroup: 3,
      spaceBetween: 4
    },
    [breakpoints.values.md]: {
      slidesPerGroup: 4,
      spaceBetween: 32
    },
    [breakpoints.values.lg]: {
      slidesPerGroup: 5,
      spaceBetween: 32
    },
    [breakpoints.values.xl]: {
      slidesPerGroup: 6,
      spaceBetween: 44
    },
    [breakpoints.values.xxl]: {
      slidesPerGroup: 7,
      spaceBetween: 44
    }
  }
  return (
    <>
      <TemplateGalleryCarousel
        items={items}
        renderItem={(itemProps) => <StrategyItem {...itemProps} />}
        breakpoints={swiperBreakpoints}
      />
    </>
  )
}
