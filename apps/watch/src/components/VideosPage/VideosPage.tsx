import { gql, useQuery } from '@apollo/client'
import { ReactElement, useEffect, useState } from 'react'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { LanguageOption } from '@core/shared/ui/LanguageAutocomplete'

import { GetLanguages } from '../../../__generated__/GetLanguages'
import { useLanguage } from '../../libs/languageContext/LanguageContext'
import { GetVideos } from '../../../__generated__/GetVideos'
import { VideosFilter } from '../../../__generated__/globalTypes'
import { VIDEO_CHILD_FIELDS } from '../../libs/videoChildFields'
import { PageWrapper } from '../PageWrapper'
import { VideoGrid } from '../VideoGrid/VideoGrid'
import { VideosHero } from './Hero'
import { VideosSubHero } from './SubHero'
import { LanguagesFilter } from './LanguagesFilter'
import { CurrentFilters } from './CurrentFilters'

export const GET_VIDEOS = gql`
  ${VIDEO_CHILD_FIELDS}
  query GetVideos(
    $where: VideosFilter
    $offset: Int
    $limit: Int
    $languageId: ID
  ) {
    videos(where: $where, offset: $offset, limit: $limit) {
      ...VideoChildFields
    }
  }
`

export const GET_LANGUAGES = gql`
  query GetLanguages($languageId: ID) {
    languages(limit: 5000) {
      id
      name(languageId: $languageId, primary: true) {
        value
        primary
      }
    }
  }
`

export const limit = 20
export const defaultFilter: VideosFilter = {}

function isAtEnd(count: number, limit: number, previousCount: number): boolean {
  if (count === previousCount) return true
  return count % limit !== 0
}

export function VideosPage(): ReactElement {
  const languageContext = useLanguage()
  const [isEnd, setIsEnd] = useState(false)
  const [previousCount, setPreviousCount] = useState(0)
  const [languageFilter, setLanguageFilter] = useState<string[]>(['529'])
  const [filter, setFilter] = useState<VideosFilter>({
    ...defaultFilter,
    availableVariantLanguageIds: languageFilter
  })

  const { data, loading, fetchMore, refetch } = useQuery<GetVideos>(
    GET_VIDEOS,
    {
      variables: {
        where: filter,
        offset: 0,
        limit: limit,
        languageId: languageContext?.id ?? '529'
      }
    }
  )

  const { data: languagesData, loading: languagesLoading } =
    useQuery<GetLanguages>(GET_LANGUAGES, {
      variables: { languageId: '529' }
    })

  useEffect(() => {
    setIsEnd(isAtEnd(data?.videos.length ?? 0, limit, previousCount))
  }, [data?.videos.length, setIsEnd, previousCount])

  const handleLoadMore = async (): Promise<void> => {
    if (isEnd) return

    setPreviousCount(data?.videos.length ?? 0)
    await fetchMore({
      variables: {
        offset: data?.videos.length ?? 0
      }
    })
  }

  useEffect(() => {
    void refetch({
      where: filter,
      offset: 0,
      limit: limit,
      languageId: languageContext?.id ?? '529'
    })
  }, [filter, refetch, languageContext])

  // toggles languages to be filtered
  function handleChangeLanguage(selectedLanguage: LanguageOption): void {
    const activeLanguage = languageFilter.find(
      (id) => id === selectedLanguage.id
    )
    if (activeLanguage != null) {
      setLanguageFilter(
        languageFilter.filter(
          (languageId) => languageId !== selectedLanguage.id
        )
      )
    } else {
      setLanguageFilter([...languageFilter, selectedLanguage.id])
    }

    setFilter({ ...filter, availableVariantLanguageIds: languageFilter })
  }

  return (
    <PageWrapper hero={<VideosHero />}>
      <Container maxWidth="xxl">
        <VideosSubHero />
        <Divider
          sx={{ height: 2, mb: 12, background: 'rgba(33, 33, 33, 0.08)' }}
        />
        <CurrentFilters />
        <Stack
          direction={{ xs: 'column', md: 'column', lg: 'row' }}
          spacing={19}
        >
          <LanguagesFilter
            onChange={handleChangeLanguage}
            languages={languagesData?.languages}
            loading={languagesLoading}
          />
          <VideoGrid
            videos={data?.videos ?? []}
            onLoadMore={handleLoadMore}
            loading={loading}
            hasNextPage={!isEnd}
          />
        </Stack>
      </Container>
    </PageWrapper>
  )
}
