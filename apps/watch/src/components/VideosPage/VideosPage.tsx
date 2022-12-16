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
import { SubtitleLanguagesFilter } from './SubtitleLanguagesFilter'

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
  const [languageFilter, setLanguageFilter] = useState<LanguageOption[]>([])
  const [subtitleLanguageFilter, setSubtitleLanguageFilter] = useState<
    LanguageOption[]
  >([])
  const [filter, setFilter] = useState<VideosFilter>(defaultFilter)

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

  function handleChange(selectedLanguage: LanguageOption): void {
    const activeLanguage = languageFilter.find(
      (language) => language === selectedLanguage
    )
    if (activeLanguage == null) {
      setLanguageFilter([...languageFilter, selectedLanguage])
      const languageIds = languageFilter.map((language) => language.id)
      setFilter({
        ...filter,
        availableVariantLanguageIds: languageIds
      })
    }
  }

  function handleSubtitleChange(selectedLanguage: LanguageOption): void {
    const activeLanguage = subtitleLanguageFilter.find(
      (language) => language === selectedLanguage
    )
    if (activeLanguage == null) {
      setSubtitleLanguageFilter([...subtitleLanguageFilter, selectedLanguage])
      const languageIds = languageFilter.map((language) => language.id)
      setFilter({
        ...filter,
        subtitleLanguageIds: languageIds
      })
    }
  }

  function handleRemove(selectedLanguage: LanguageOption): void {
    setLanguageFilter(
      languageFilter.filter((language) => language.id !== selectedLanguage.id)
    )
    const languageIds = languageFilter.map((language) => language.id)
    setFilter({
      ...filter,
      availableVariantLanguageIds: languageIds
    })
  }

  return (
    <PageWrapper hero={<VideosHero />}>
      <Container maxWidth="xxl">
        <VideosSubHero />
        <Divider
          sx={{ height: 2, mb: 12, background: 'rgba(33, 33, 33, 0.08)' }}
        />
        <CurrentFilters
          languageFilters={languageFilter}
          onDelete={handleRemove}
        />
        <Stack
          direction={{ xs: 'column', md: 'column', lg: 'row' }}
          spacing={19}
        >
          <Stack direction="column" spacing={5} sx={{ minWidth: '278px' }}>
            <Divider />
            <LanguagesFilter
              onChange={handleChange}
              languages={languagesData?.languages}
              loading={languagesLoading}
            />
            <Divider />
            <SubtitleLanguagesFilter
              onChange={handleSubtitleChange}
              languages={languagesData?.languages}
              loading={languagesLoading}
            />
            <Divider />
          </Stack>

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
