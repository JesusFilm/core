import { ContentCarousel } from '@core/shared/ui/ContentCarousel'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { SwiperOptions } from 'swiper/types'
import { StrategyItem } from './StrategyItem'

export interface StrategyCarouselItemProps {
  id: string
  title: string
  description: string
  imageUrl: string
  link: string
}

interface StrategySectionProps {
  items: Array<StrategyCarouselItemProps>
}

//might need to update the props that get passed in
// dependent on algolia
export function StrategySection({ items }: StrategySectionProps): ReactElement {
  // const { items } = useHits(props)
  // post type label
  // description
  // strategycarousel

  // use hook at this level
  // pass hits down into stratetgycarousel

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

  const { t } = useTranslation('apps-watch')
  const ButtonStack = () => {
    return (
      <Stack direction="row" spacing={2}>
        <Button>{t('Learn More')}</Button>
        <Button>{t('Request Catalog')}</Button>
        <Button>{t('Get in touch')}</Button>
        <Button variant="contained" sx={{ borderRadius: '32px' }}>
          {t('Register for Training')}
        </Button>
      </Stack>
    )
  }
  return (
    <>
      <Stack
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography variant="h4">{t('Fake Title')}</Typography>
        <ButtonStack />
      </Stack>
      {/* <Typography variant="subtitle1">{t(description)}</Typography> */}
      <ContentCarousel
        items={items}
        renderItem={(itemProps) => <StrategyItem {...itemProps} />}
        breakpoints={swiperBreakpoints}
      />
    </>
  )
}
