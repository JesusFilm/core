import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import {
  type ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { Index } from 'react-instantsearch'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { VideoLabel } from '../../../__generated__/globalTypes'
import { VideoContentFields } from '../../../__generated__/VideoContentFields'
import { useAlgoliaRouter } from '../../libs/algolia/useAlgoliaRouter'
import { PlayerProvider, usePlayer } from '../../libs/playerContext'
import { VideoProvider } from '../../libs/videoContext'
import { WatchProvider } from '../../libs/watchContext'
import { Header } from '../Header'
import { ContentPageBlurFilter } from '../NewVideoContentPage/ContentPageBlurFilter'
import { VideoCarousel } from '../NewVideoContentPage/VideoCarousel/VideoCarousel'
import { VideoContentHero } from '../NewVideoContentPage/VideoContentHero/VideoContentHero'
import { SearchComponent } from '../SearchComponent'
import { useCarouselVideos } from '../VideoHero/libs/useCarouselVideos'

import { SeeAllVideos } from './SeeAllVideos'

interface WatchHomePageProps {
  languageId?: string | undefined
}

function WatchHomePageContent({ languageId }: WatchHomePageProps): ReactElement {
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX ?? ''

  return (
    <Index indexName={indexName}>
      <WatchHomePageBody languageId={languageId} />
    </Index>
  )
}

// Inner component that uses player context
function WatchHomePageBody({
  languageId
}: WatchHomePageProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  useAlgoliaRouter()
  
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX ?? ''

  const [activeVideoId, setActiveVideoId] = useState<string | undefined>()
  const {
    videos,
    currentIndex,
    loading,
    moveToNext,
    jumpToVideo
  } = useCarouselVideos('529') // Use language ID 529 for now
  const [autoProgressEnabled] = useState(true)

  // Map videos to ensure data structure matches what VideoCard expects
  const carouselVideos = videos.map((video) => ({
    __typename: 'Video' as const,
    id: video.id,
    slug: video.slug,
    childrenCount: video.childrenCount,
    title: (video.title || [{ value: video.slug }]).map((t) => ({
      __typename: 'VideoTitle' as const,
      value: t.value
    })),
    images: (video.images || []).map((img) => ({
      __typename: 'CloudflareImage' as const,
      mobileCinematicHigh: img.mobileCinematicHigh
    })),
    imageAlt: (
      video.imageAlt || [{ value: video.title?.[0]?.value || video.slug }]
    ).map((alt) => ({
      __typename: 'VideoImageAlt' as const,
      value: alt.value
    })),
    snippet: [{ __typename: 'VideoSnippet' as const, value: '' }],
    label:
      video.label &&
      Object.values(VideoLabel).includes(video.label as VideoLabel)
        ? (video.label as VideoLabel)
        : VideoLabel.shortFilm,
    variant: video.variant
      ? {
          __typename: 'VideoVariant' as const,
          id: video.variant.id,
          duration: video.variant.duration,
          hls: video.variant.hls,
          slug: video.variant.slug
        }
      : null
  }))

  // Get current video from videos array using currentIndex
  const currentVideo = videos[currentIndex] || null

  const { state: playerState } = usePlayer()
  const [lastProgress, setLastProgress] = useState(0)
  const [isProgressing, setIsProgressing] = useState(false)
  const resetRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Set the current video as active
  useEffect(() => {
    if (currentVideo && currentVideo.id !== activeVideoId) {
      setActiveVideoId(currentVideo.id)
    }
  }, [currentVideo, activeVideoId])

  // Reset progress tracking when video changes
  useEffect(() => {
    setLastProgress(0)
    if (resetRef.current != null) clearTimeout(resetRef.current)
    resetRef.current = setTimeout(() => {
      setIsProgressing(false)
    }, 500)
  }, [activeVideoId])

  // Auto-progress to next video function
  const progressToNextVideo = useCallback(() => {
    if (!autoProgressEnabled || isProgressing || !videos.length) return

    setIsProgressing(true)

    // Use moveToNext from useCarouselVideos hook
    moveToNext()
    setLastProgress(0) // Reset progress tracking for new video

    // Allow progression again after a short delay
    if (resetRef.current != null) clearTimeout(resetRef.current)
    resetRef.current = setTimeout(() => {
      setIsProgressing(false)
    }, 2000)
  }, [moveToNext, autoProgressEnabled, isProgressing, videos.length])

  // Effect to detect video end and progress immediately
  useEffect(() => {
    // Check if video has ended (progress >= 95%)
    if (playerState.progress >= 95 && lastProgress < 95 && !isProgressing) {
      progressToNextVideo()
    }
    setLastProgress(playerState.progress)
  }, [playerState.progress, lastProgress, progressToNextVideo, isProgressing])

  // Get the active video for playback (current video from carousel)
  // Transform CarouselVideo to VideoContentFields for VideoProvider
  const activeVideo: VideoContentFields = useMemo(() => {
    if (currentVideo == null) {
      return {
        __typename: 'Video',
        id: '',
        slug: '',
        label: VideoLabel.shortFilm,
        title: [],
        images: [],
        imageAlt: [],
        snippet: [],
        description: [],
        studyQuestions: [],
        bibleCitations: [],
        variant: null,
        variantLanguagesCount: 0,
        childrenCount: 0
      }
    }

    const title = (currentVideo.title ?? []).map((t) => ({
      __typename: 'VideoTitle' as const,
      value: t.value
    }))

    const images = (currentVideo.images ?? []).map((img) => ({
      __typename: 'CloudflareImage' as const,
      mobileCinematicHigh: img.mobileCinematicHigh
    }))

    const imageAlt = (currentVideo.imageAlt ?? []).map((alt) => ({
      __typename: 'VideoImageAlt' as const,
      value: alt.value
    }))

    const snippet: VideoContentFields['snippet'] = []
    const description: VideoContentFields['description'] = []
    const studyQuestions: VideoContentFields['studyQuestions'] = []
    const bibleCitations: VideoContentFields['bibleCitations'] = []

    const variant =
      currentVideo.variant &&
      currentVideo.variant.id &&
      currentVideo.variant.duration !== undefined &&
      currentVideo.variant.hls &&
      currentVideo.variant.slug
        ? {
            __typename: 'VideoVariant' as const,
            id: currentVideo.variant.id,
            duration: currentVideo.variant.duration,
            hls: currentVideo.variant.hls,
            downloadable: false,
            downloads: [],
            language: {
              __typename: 'Language' as const,
              id: '529',
              name: [
                {
                  __typename: 'LanguageName' as const,
                  value: 'English',
                  primary: true
                }
              ],
              bcp47: 'en'
            },
            slug: currentVideo.variant.slug,
            subtitleCount: 0
          }
        : null

    return {
      __typename: 'Video' as const,
      id: currentVideo.id,
      slug: currentVideo.slug,
      label:
        currentVideo.label &&
        Object.values(VideoLabel).includes(currentVideo.label as VideoLabel)
          ? (currentVideo.label as VideoLabel)
          : VideoLabel.shortFilm,
      title,
      images,
      imageAlt,
      snippet,
      description,
      studyQuestions,
      bibleCitations,
      variant,
      variantLanguagesCount: 1,
      childrenCount: currentVideo.childrenCount ?? 0
    }
  }, [currentVideo])

  return (
    <div>
      <Header
        themeMode={ThemeMode.dark}
        hideTopAppBar
        hideBottomAppBar
        hideSpacer
        showLanguageSwitcher
      />
      <Index indexName={indexName}>
        <SearchComponent languageId={languageId} floating={true} />
      </Index>
      <VideoProvider value={{ content: activeVideo }}>
        <VideoContentHero isPreview={true} languageId={languageId} />
      </VideoProvider>

      <ContentPageBlurFilter>
        <div className="pt-4">
          <VideoCarousel
            videos={carouselVideos}
            activeVideoId={activeVideoId}
            loading={loading}
            onVideoSelect={(videoId: string) => {
              // Jump to the selected video in the carousel system
              const success = jumpToVideo(videoId)
              if (success) {
                setIsProgressing(false)
                // Note: activeVideoId will be automatically updated by the currentVideo sync effect
              }
            }}
            onSlideChange={(activeIndex: number) => {
              // Note: Slide changes in the carousel don't directly affect video playback
              // Video playback is controlled by the useCarouselVideos hook
            }}
          />
        </div>
        <div
          data-testid="WatchHomePage"
          className="flex flex-col py-20 z-10 responsive-container"
        >
          <ThemeProvider
            themeName={ThemeName.website}
            themeMode={ThemeMode.dark}
            nested
          >
            <SeeAllVideos />
            <Box
              sx={{
                display: 'flex',
                width: '100%',
                alignItems: 'center',
                position: 'relative',
                py: { xs: 10, lg: 20 }
              }}
            >
              <Stack spacing={10}>
                <Typography variant="h3" component="h2" color="text.primary">
                  {t('About Our Project')}
                </Typography>
                <Stack direction="row" spacing={4}>
                  <Box
                    sx={{
                      backgroundColor: 'primary.main',
                      height: 'inherit',
                      width: { xs: 38, lg: 14 }
                    }}
                  />
                  <Typography
                    variant="subtitle2"
                    component="h3"
                    sx={{ opacity: 0.85 }}
                    color="text.primary"
                  >
                    {t(
                      'With 70% of the world not being able to speak English, there ' +
                        'is a huge opportunity for the gospel to spread to unreached ' +
                        'places. We have a vision to make it easier to watch, ' +
                        'download and share Christian videos with people in their ' +
                        'native heart language.'
                    )}
                  </Typography>
                </Stack>
                <Typography
                  variant="subtitle1"
                  component="h3"
                  sx={{ opacity: 0.8 }}
                  color="text.primary"
                >
                  {t(
                    'Jesus Film Project is a Christian ministry with a vision to ' +
                      'reach the world with the gospel of Jesus Christ through ' +
                      'evangelistic videos. Watch from over 2000 languages on any ' +
                      'device and share it with others.'
                  )}
                </Typography>
              </Stack>
            </Box>
          </ThemeProvider>
        </div>
      </ContentPageBlurFilter>
    </div>
  )
}

// Main component with providers
export function WatchHomePage({
  languageId
}: WatchHomePageProps): ReactElement {
  return (
    <PlayerProvider>
      <WatchProvider>
        <WatchHomePageContent languageId={languageId} />
      </WatchProvider>
    </PlayerProvider>
  )
}
