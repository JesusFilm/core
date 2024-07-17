import { ContentCarousel } from '@core/shared/ui/ContentCarousel'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { Hit } from 'instantsearch.js'
import { ReactElement } from 'react'
import { useHits } from 'react-instantsearch'
import { SwiperOptions } from 'swiper/types'
import { StrategyCard } from '../StrategyCard'

type hitItem = {
  id: string
  title: string
  description: string
  imageUrl: string
  link: string
}

function createItemsFromHits(hits: Hit[]): hitItem[] {
  return hits.map((hit) => ({
    id: hit.ObjectID,
    title: hit.post_title,
    description: hit.content,
    imageUrl: hit.images.thumbnail?.url,
    link: hit.permalink
  }))
}

function getTitleText(hits: Hit[]): string {
  return hits[0]?.post_type_label ?? ''
}

export function StrategySection(): ReactElement {
  const { breakpoints } = useTheme()

  const { hits } = useHits()

  const newItems = createItemsFromHits(hits)

  const titleText = getTitleText(hits)

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
      <Typography data-testid="StrategySectionTitle" variant="h4">
        {titleText}
      </Typography>
      <Container maxWidth={false} sx={{ overflow: 'hidden' }}>
        <ContentCarousel
          items={newItems}
          renderItem={(itemProps) => <StrategyCard {...itemProps} />}
          breakpoints={swiperBreakpoints}
          slidesOffsetBefore={-32} // aligns left padding of carousel with rest of page content
        />
      </Container>
    </Box>
  )
}
