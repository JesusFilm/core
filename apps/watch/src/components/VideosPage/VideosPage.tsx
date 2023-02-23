import { gql, useQuery } from '@apollo/client'
import { ReactElement, useMemo, useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { LanguageOption } from '@core/shared/ui/LanguageAutocomplete'
import TextField from '@mui/material/TextField'
import { debounce } from 'lodash'
import Router, { useRouter } from 'next/router'
import { GetLanguages } from '../../../__generated__/GetLanguages'
import { useLanguage } from '../../libs/languageContext/LanguageContext'
import { GetVideos } from '../../../__generated__/GetVideos'
import { VideosFilter } from '../../../__generated__/globalTypes'
import { VIDEO_CHILD_FIELDS } from '../../libs/videoChildFields'
import { PageWrapper } from '../PageWrapper'
import { VideoGrid } from '../VideoGrid/VideoGrid'
import { FilterContainer } from '../FilterContainer/FilterContainer'
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

const subtitleLanguageIds = [
  '411',
  '448',
  '483',
  '494',
  '496',
  '529',
  '531',
  '584',
  '1106',
  '1109',
  '1112',
  '1269',
  '1341',
  '1942',
  '1964',
  '3804',
  '3887',
  '3934',
  '3964',
  '3974',
  '4415',
  '4432',
  '4601',
  '4820',
  '4823',
  '5541',
  '5545',
  '5546',
  '5563',
  '6464',
  '6788',
  '7083',
  '7698',
  '16639',
  '20601',
  '20770',
  '21028',
  '21046',
  '21064',
  '21753',
  '21754',
  '22500',
  '22658',
  '23178',
  '53299',
  '53424',
  '139081',
  '139089',
  '140126',
  '184497',
  '184498',
  '184506',
  '184528'
]

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

const updateQuery = (param: string, newQuery: string | undefined): void => {
  if (newQuery != null && Router !== undefined) {
    void Router.push(`/videos/?${param}=${encodeURI(newQuery)}`, undefined, {
      shallow: true
    })
  }
}

export function VideosPage({ videos }): ReactElement {
  const router = useRouter()
  const query =
    router === null ||
    router.query === null ||
    router === undefined ||
    router.query === undefined
      ? {}
      : router.query
  const languageContext = useLanguage()
  const [isEnd, setIsEnd] = useState(false)
  const [previousCount, setPreviousCount] = useState(0)
  const [languageFilter, setLanguageFilter] = useState<
    LanguageOption | undefined
  >()
  const [titleFilter, setTitleFilter] = useState<string | undefined>()
  const [subtitleLanguageFilter, setSubtitleLanguageFilter] = useState<
    LanguageOption | undefined
  >()
  const [filter, setFilter] = useState<VideosFilter>({
    availableVariantLanguageIds:
      languageFilter != null ? [languageFilter.id] : undefined,
    subtitleLanguageIds:
      subtitleLanguageFilter != null ? [subtitleLanguageFilter.id] : undefined,
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

  const subtitleLanguages = languagesData?.languages.filter((language) =>
    subtitleLanguageIds.includes(language.id)
  )

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

  useEffect(() => {
    void refetch({
      where: filter,
      offset: 0,
      limit,
      languageId: languageContext?.id ?? '529'
    })
  }, [filter, refetch, languageContext])

  useEffect(() => {
    const selectedLanguage =
      query.subtitle instanceof Array ? query.subtitle[0] : query.subtitle

    if (selectedLanguage !== undefined) {
      const lang = languagesData?.languages.find(
        (language) => language.id === selectedLanguage
      )
      if (lang != null) {
        setSubtitleLanguageFilter({
          id: lang.id,
          localName: lang.name.find(({ primary }) => !primary)?.value,
          nativeName: lang.name.find(({ primary }) => primary)?.value
        })
      }
      setFilter({
        subtitleLanguageIds: lang != null ? [lang.id] : undefined
      })
      setLanguageFilter(undefined)
      setTitleFilter(undefined)
    }
  }, [languagesData?.languages, query.subtitle])

  useEffect(() => {
    const selectedLanguage =
      query.language instanceof Array ? query.language[0] : query.language

    if (selectedLanguage !== undefined) {
      const lang = languagesData?.languages.find(
        (language) => language.id === selectedLanguage
      )

      if (lang != null) {
        setLanguageFilter({
          id: lang.id,
          localName: lang.name.find(({ primary }) => !primary)?.value,
          nativeName: lang.name.find(({ primary }) => primary)?.value
        })
      }
      setTitleFilter(undefined)
      setSubtitleLanguageFilter(undefined)
      setFilter({
        availableVariantLanguageIds:
          selectedLanguage != null ? [selectedLanguage] : undefined
      })
    }
  }, [languagesData?.languages, query.language])

  useEffect(() => {
    const selectedTitle =
      query.title instanceof Array ? query.title[0] : query.title

    if (selectedTitle !== undefined) {
      setSubtitleLanguageFilter(undefined)
      setLanguageFilter(undefined)
      if (titleFilter === undefined) {
        setTitleFilter(selectedTitle)
      }
      setFilter({
        title: selectedTitle
      })
    }
  }, [query.title, titleFilter])

  function handleSubtitleLanguageChange(
    selectedLanguage: LanguageOption
  ): void {
    updateQuery('subtitle', selectedLanguage.id)
  }

  function handleLanguageChange(selectedLanguage: string | undefined): void {
    updateQuery('language', selectedLanguage)
  }

  const debouncedSubmit = useMemo(
    () =>
      debounce(
        (selectedTitle): void => {
          updateQuery('title', selectedTitle)
        },
        500,
        { maxWait: 1500 }
      ),
    []
  )

  const handleTitleChange = (selectedTitle: string | undefined): void => {
    setTitleFilter(selectedTitle)
    debouncedSubmit(selectedTitle)
  }

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
            <FilterContainer
              rowFromParent={
                subtitleLanguageFilter !== undefined
                  ? 2
                  : titleFilter !== undefined
                  ? 3
                  : 1
              }
              audioSwitcher={
                <LanguagesFilter
                  onChange={(language: LanguageOption) =>
                    handleLanguageChange(language.id)
                  }
                  value={
                    languageFilter === undefined
                      ? {
                          id: '',
                          localName: '',
                          nativeName: ''
                        }
                      : languageFilter
                  }
                  languages={languagesData?.languages}
                  loading={languagesLoading}
                />
              }
              subtitleSwitcher={
                <LanguagesFilter
                  onChange={(language: LanguageOption) =>
                    handleSubtitleLanguageChange(language)
                  }
                  value={
                    subtitleLanguageFilter === undefined
                      ? {
                          id: '',
                          localName: '',
                          nativeName: ''
                        }
                      : subtitleLanguageFilter
                  }
                  languages={subtitleLanguages}
                  loading={languagesLoading}
                  helperText="54 languages"
                />
              }
              titleSearch={
                <TextField
                  onChange={(e) => {
                    handleTitleChange(e.currentTarget.value)
                  }}
                  value={titleFilter}
                  label="Search Titles"
                  variant="outlined"
                  helperText="724+ titles"
                />
              }
            />
          </Stack>
          <Box sx={{ width: '100%' }}>
            <VideoGrid
              videos={
                (filter.availableVariantLanguageIds == null ||
                  filter.availableVariantLanguageIds.length === 0) &&
                (filter.subtitleLanguageIds == null ||
                  filter.subtitleLanguageIds.length === 0) &&
                (filter.title == null || filter.title === '')
                  ? videos
                  : data?.videos ?? []
              }
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
