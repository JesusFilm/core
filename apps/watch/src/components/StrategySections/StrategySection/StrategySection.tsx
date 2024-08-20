import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { Hit } from 'instantsearch.js'
import { ReactElement, useEffect } from 'react'
import { useHits } from 'react-instantsearch'
import { SwiperOptions } from 'swiper/types'

import { ContentCarousel } from '@core/journeys/ui/ContentCarousel'

import { StrategyCard } from '../StrategyCard'

interface StrategyCardItem {
  id: string
  title: string
  description: string
  imageUrl: string
  link: string
}

function transformAlgoliaStrategies(hits: Hit[]): StrategyCardItem[] {
  return hits.map((hit) => ({
    id: hit.ObjectID,
    title: hit.post_title,
    description: hit.content,
    imageUrl: hit.images.thumbnail?.url,
    link: hit.permalink
  }))
}

interface StrategySectionProps {
  handleItemSearch: (index: number, value: boolean) => void
  index: number
}

export function StrategySection({
  handleItemSearch,
  index
}: StrategySectionProps): ReactElement {
  const { breakpoints } = useTheme()

  const { hits } = useHits()

  const items = transformAlgoliaStrategies(hits)

  useEffect(() => {
    handleItemSearch(index, items.length > 0)
  }, [items])

  const label = (hits[0]?.post_type_label as string) ?? ''

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
          <Container maxWidth={false} sx={{ overflow: 'hidden' }}>
            <ContentCarousel
              items={items}
              renderItem={(itemProps) => <StrategyCard {...itemProps} />}
              breakpoints={swiperBreakpoints}
              slidesOffsetBefore={-32}
            />
          </Container>
        </Box>
      ) : (
        <></>
      )}
    </>
  )
}
