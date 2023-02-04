import { gql, useQuery } from '@apollo/client'
import { ReactElement, useEffect, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { LanguageOption } from '@core/shared/ui/LanguageAutocomplete'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import { debounce } from 'lodash'
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

function isAtEnd(count: number, limit: number, previousCount: number): boolean {
  if (count === previousCount) return true
  return count % limit !== 0
}

export function VideosPage(): ReactElement {
  const languageContext = useLanguage()
  const [isEnd, setIsEnd] = useState(false)
  const [previousCount, setPreviousCount] = useState(0)
  const [languageFilter, setLanguageFilter] = useState<string | undefined>()
  const [titleFilter, setTitleFilter] = useState<string | undefined>()
  const [subtitleLanguageFilter, setSubtitleLanguageFilter] = useState<
    string | undefined
  >()
  const [filter, setFilter] = useState<VideosFilter>({
    availableVariantLanguageIds:
      languageFilter != null ? [languageFilter] : undefined,
    subtitleLanguageIds:
      subtitleLanguageFilter != null ? [subtitleLanguageFilter] : undefined,
    title: titleFilter
  })

  const { data, loading, fetchMore, refetch } = useQuery<GetVideos>(
    GET_VIDEOS,
    {
      variables: {
        where: filter,
        offset: 0,
        limit,
        languageId: languageContext?.id ?? '529'
      },
      notifyOnNetworkStatusChange: true
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
      limit,
      languageId: languageContext?.id ?? '529'
    })
  }, [filter, refetch, languageContext])

  function handleSubtitleLanguageChange(selectedLanguage: string): void {
    setTitleFilter(undefined)
    setSubtitleLanguageFilter(selectedLanguage)
    setLanguageFilter(undefined)
    setFilter({
      subtitleLanguageIds:
        selectedLanguage != null ? [selectedLanguage] : undefined
    })
  }

  function handleLanguageChange(selectedLanguage: string | undefined): void {
    setTitleFilter(undefined)
    setSubtitleLanguageFilter(undefined)
    setLanguageFilter(selectedLanguage)
    setFilter({
      availableVariantLanguageIds:
        selectedLanguage != null ? [selectedLanguage] : undefined
    })
  }

  const debouncedSubmit = useMemo(
    () =>
      debounce(
        (selectedTitle): void => {
          setTitleFilter(selectedTitle)
          setSubtitleLanguageFilter(undefined)
          setLanguageFilter(undefined)
          setFilter({
            title: selectedTitle
          })
        },
        500,
        { maxWait: 1500 }
      ),
    []
  )

  const handleTitleChange = (selectedTitle: string | undefined): void =>
    debouncedSubmit(selectedTitle)

  return (
    <PageWrapper hero={<VideosHero />}>
      <Container maxWidth="xxl">
        <VideosSubHero />
      </Container>

      <Divider
        sx={{ height: 2, mb: 12, background: 'rgba(33, 33, 33, 0.08)' }}
      />

      <Container maxWidth="xxl">
        <Stack
          direction={{ xs: 'column', xl: 'row' }}
          spacing={{ xs: 4, xl: 8 }}
        >
          <Stack
            direction="column"
            spacing={{ xs: 0, xl: 5 }}
            sx={{ minWidth: '278px', maxWidth: '335px' }}
          >
            <Divider
              sx={{
                display: { sm: 'none', xl: 'flex' },
                height: 2,
                background: 'rgba(33, 33, 33, 0.08)'
              }}
            />
            <Typography>Titles</Typography>
            <TextField
              onChange={(e) => {
                handleTitleChange(e.currentTarget.value)
              }}
              label="Search Titles"
              variant="outlined"
              helperText="+724 titles"
            />
            <Divider
              sx={{
                display: { sm: 'none', xl: 'flex' },
                height: 2,
                background: 'rgba(33, 33, 33, 0.08)'
              }}
            />
            <Typography>Audio Languages</Typography>
            <LanguagesFilter
              onChange={(language: LanguageOption) =>
                handleLanguageChange(language.id)
              }
              languages={languagesData?.languages}
              loading={languagesLoading}
            />
            <Divider
              sx={{
                display: { sm: 'none', xl: 'flex' },
                height: 2,
                background: 'rgba(33, 33, 33, 0.08)'
              }}
            />
            <Typography>Subtitle Languages</Typography>
            <LanguagesFilter
              onChange={(language: LanguageOption) =>
                handleSubtitleLanguageChange(language.id)
              }
              languages={languagesData?.languages}
              loading={languagesLoading}
            />
            <Divider
              sx={{
                display: { sm: 'none', xl: 'flex' },
                height: 2,
                background: 'rgba(33, 33, 33, 0.08)'
              }}
            />
          </Stack>
          <Box sx={{ width: '100%' }}>
            <VideoGrid
              videos={data?.videos ?? []}
              onLoadMore={handleLoadMore}
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
