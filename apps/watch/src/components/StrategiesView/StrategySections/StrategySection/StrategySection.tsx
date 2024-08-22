import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { ReactElement, useEffect } from 'react'
import { SwiperOptions } from 'swiper/types'

import { ContentCarousel } from '@core/journeys/ui/ContentCarousel'

import { useAlgoliaStrategies } from '../../../../libs/algolia/useAlgoliaStrategies'
import { StrategyCard } from '../StrategyCard'

export interface StrategySectionProps {
  handleItemSearch: (index: number, value: boolean) => void
  index: number
}

export function StrategySection({
  handleItemSearch,
  index
}: StrategySectionProps): ReactElement {
  const { breakpoints } = useTheme()

  const { label, hits: items } = useAlgoliaStrategies()

  useEffect(() => {
    handleItemSearch(index, items.length > 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

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
      {items.length > 0 ? (
        <Box data-testid="StrategySection">
          <Typography variant="h5">{label}</Typography>
          <Container maxWidth={false}>
            <ContentCarousel
              items={items}
              renderItem={(itemProps) => <StrategyCard {...itemProps} />}
              breakpoints={swiperBreakpoints}
              slidesOffsetBefore={-32}
              content="strategies-section"
            />
          </Container>
        </Box>
      ) : (
        <></>
      )}
    </>
  )
}
