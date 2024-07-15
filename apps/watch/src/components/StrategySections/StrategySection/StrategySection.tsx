import { ContentCarousel } from '@core/shared/ui/ContentCarousel'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { SwiperOptions } from 'swiper/types'
import { StrategyCard } from '../StrategyCard'

const longDescription =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum'

const imageSrc =
  'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920'

const items = [
  {
    title: 'Title 1',
    description: longDescription,
    id: 'test-id',
    imageUrl: imageSrc,
    link: ''
  },
  {
    title: 'Title',
    description: longDescription,
    id: 'test-id',
    imageUrl: imageSrc,
    link: ''
  },
  {
    title: 'Title',
    description: longDescription,
    id: 'test-id',
    imageUrl: imageSrc,
    link: ''
  },
  {
    title: 'Title',
    description: longDescription,
    id: 'test-id',
    imageUrl: imageSrc,
    link: ''
  },
  {
    title: 'Title',
    description: 'description',
    id: 'test-id',
    imageUrl: imageSrc,
    link: ''
  },
  {
    title: 'Title',
    description: 'description',
    id: 'test-id',
    imageUrl: imageSrc,
    link: ''
  },
  {
    title: 'Title',
    description: 'description',
    id: 'test-id',
    imageUrl: imageSrc,
    link: ''
  },
  {
    title: 'Title',
    description: 'description',
    id: 'test-id',
    imageUrl: imageSrc,
    link: ''
  },
  {
    title: 'Title',
    description: 'description',
    id: 'test-id',
    imageUrl: imageSrc,
    link: ''
  }
]

export function StrategySection(): ReactElement {
  const { t } = useTranslation('apps-watch')
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
    <Box data-testid="StrategySection">
      <Typography variant="h4">{t('Fake Title')}</Typography>
      <ContentCarousel
        items={items}
        renderItem={(itemProps) => <StrategyCard {...itemProps} />}
        breakpoints={swiperBreakpoints}
      />
    </Box>
  )
}
