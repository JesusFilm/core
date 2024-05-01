'use client'

import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { useRouter, useSearchParams } from 'next/navigation'
import { ReactElement } from 'react'

import { VideoChildFields } from '../../../__generated__/VideoChildFields'
import { PageWrapper } from '../PageWrapper'
import { VideoGrid } from '../VideoGrid/VideoGrid'

import { FilterList } from './FilterList'
import { VideoPageFilter } from './FilterList/FilterList'
import { VideosHero } from './Hero'
import { VideosSubHero } from './SubHero'
import { checkFilterApplied } from './utils/checkFilterApplied'
import { useVideoSearch } from './utils/useVideoSearch'

interface VideoProps {
  videos: VideoChildFields[]
}

export function VideosPage({ videos }: VideoProps): ReactElement {
  const router = useRouter()

  const localVideos = videos.filter((video) => video != null)

  const searchParams = useSearchParams()

  const filter = {
    availableVariantLanguageIds:
      searchParams.get('languages')?.split(',') ?? [],
    subtitleLanguageIds:
      searchParams.get('subtitles')?.split(',') ?? ([] as string[]),
    title: searchParams.get('title') ?? undefined
  }

  const { algoliaVideos, isEnd, loading, handleLoadMore } = useVideoSearch({
    filter
  })

  function handleFilterChange(filter: VideoPageFilter): void {
    const queryObject: Record<string, string> = {}
    if (filter.availableVariantLanguageIds?.[0] != null)
      queryObject.languages = filter.availableVariantLanguageIds[0]
    if (filter.subtitleLanguageIds?.[0] != null)
      queryObject.subtitles = filter.subtitleLanguageIds[0]
    if (filter.title != null) queryObject.title = filter.title

    const querystring = new URLSearchParams(queryObject).toString()
    router.push(`?${querystring}`, { scroll: false })
  }

  return (
    <PageWrapper hero={<VideosHero />} testId="VideosPage">
      <Container maxWidth="xxl">
        <VideosSubHero />
      </Container>
      <Divider sx={{ height: 2, background: 'rgba(33, 33, 33, 0.08)' }} />
      <Container maxWidth="xxl" sx={{ py: 12 }}>
        <Stack
          direction={{ xs: 'column', xl: 'row' }}
          spacing={{ xs: 4, xl: 8 }}
        >
          <Box sx={{ minWidth: '278px' }}>
            <FilterList filter={filter} onChange={handleFilterChange} />
          </Box>
          <Box sx={{ width: '100%' }}>
            <VideoGrid
              videos={
                algoliaVideos.length === 0 && !checkFilterApplied(filter)
                  ? localVideos
                  : algoliaVideos
              }
              onLoadMore={handleLoadMore as () => void}
              loading={loading}
              hasNextPage={!isEnd}
              variant="expanded"
            />
          </Box>
        </Stack>
      </Container>
    </PageWrapper>
  )
}
