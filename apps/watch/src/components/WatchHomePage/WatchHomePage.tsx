import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
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

import { SearchBarProvider } from '@core/journeys/ui/algolia/SearchBarProvider'
import { SearchBar } from '@core/journeys/ui/SearchBar'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { useAlgoliaRouter } from '../../libs/algolia/useAlgoliaRouter'
import { PageWrapper } from '../PageWrapper'
import { AlgoliaVideoGrid } from '../VideoGrid/AlgoliaVideoGrid'
import { VideoLabel } from '../../../__generated__/globalTypes'
import { VideoContentFields } from '../../../__generated__/VideoContentFields'

import { HomeHero } from './HomeHero'
import { SeeAllVideos } from './SeeAllVideos'
import { ContentPageBlurFilter } from '../NewVideoContentPage/ContentPageBlurFilter'
import NextLink from 'next/link'
import Image from 'next/image'
import { PlayerProvider } from '../../libs/playerContext'
import { VideoProvider } from '../../libs/videoContext'
import { WatchProvider } from '../../libs/watchContext'
import { useCarouselVideos } from '../VideoHero/libs/useCarouselVideos'
import { VideoContentHero } from '../NewVideoContentPage/VideoContentHero/VideoContentHero'
import { VideoCarousel } from '../NewVideoContentPage/VideoCarousel/VideoCarousel'
import { usePlayer } from '../../libs/playerContext'
import type { VideoCarouselSlide, CarouselMuxSlide } from '../../types/inserts'
import { isMuxSlide, isVideoSlide } from '../../types/inserts'

interface WatchHomePageProps {
  languageId?: string | undefined
}

// Inner component that uses player context
function WatchHomePageContent({
  languageId
}: WatchHomePageProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  useAlgoliaRouter()

  const [activeVideoId, setActiveVideoId] = useState<string | undefined>()
  const {
    videos,
    slides: rawSlides,
    currentIndex,
    loading,
    moveToNext,
    jumpToVideo,
    currentPoolIndex
  } = useCarouselVideos('529') // Use language ID 529 for now
  const [displaySlides, setDisplaySlides] = useState<VideoCarouselSlide[]>(rawSlides)
  const [autoProgressEnabled, setAutoProgressEnabled] = useState(true)
  const [currentSlideId, setCurrentSlideId] = useState<string | null>(null)
  useEffect(() => {
    setDisplaySlides((prevSlides) => {
      if (prevSlides === rawSlides) return prevSlides

      const previousByKey = new Map(
        prevSlides.map((slide) => [`${slide.source}:${slide.id}`, slide])
      )

      const nextSlides = rawSlides.map((slide) => {
        const key = `${slide.source}:${slide.id}`
        const previousSlide = previousByKey.get(key)

        if (
          previousSlide != null &&
          isMuxSlide(slide) &&
          isMuxSlide(previousSlide) &&
          previousSlide.playbackId === slide.playbackId &&
          previousSlide.playbackIndex === slide.playbackIndex
        ) {
          return previousSlide
        }

        if (
          previousSlide != null &&
          isVideoSlide(slide) &&
          isVideoSlide(previousSlide) &&
          previousSlide.video === slide.video
        ) {
          return previousSlide
        }

        return slide
      })

      const isSameLength = nextSlides.length === prevSlides.length
      if (
        isSameLength &&
        nextSlides.every((slide, idx) => slide === prevSlides[idx])
      ) {
        return prevSlides
      }

      return nextSlides
    })
  }, [rawSlides])

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

  // Get the current slide (could be video or mux insert)
  const currentSlide: VideoCarouselSlide | null = useMemo(() => {
    if (currentSlideId) {
      // If a specific slide is selected, find it
      return (
        displaySlides.find((slide) => slide.id === currentSlideId) || null
      )
    }

    // Default to the first slide (mux insert or first video)
    if (displaySlides.length > 0) {
      return displaySlides[0]
    }

    return null
  }, [currentSlideId, displaySlides])

  const currentSlideIndex = useMemo(() => {
    if (!currentSlide) return -1
    return displaySlides.findIndex((slide) => slide.id === currentSlide.id)
  }, [currentSlide, displaySlides])

  const currentMuxInsert: CarouselMuxSlide | null = useMemo(() => {
    if (currentSlide != null && isMuxSlide(currentSlide)) {
      return currentSlide
    }
    return null
  }, [currentSlide])

  const { state: playerState } = usePlayer()
  const [lastProgress, setLastProgress] = useState(0)
  const [isProgressing, setIsProgressing] = useState(false)
  const resetRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Set the current slide as active (includes both videos and mux inserts)
  useEffect(() => {
    if (currentSlide && currentSlide.id !== activeVideoId) {
      setActiveVideoId(currentSlide.id)
    }
  }, [currentSlide, activeVideoId])

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
    if (!autoProgressEnabled || isProgressing || !displaySlides.length) return

    setIsProgressing(true)

    // Use moveToNext from useCarouselVideos hook
    moveToNext()

    // Update currentSlideId to sync the main video with the carousel
    const nextIndex = currentIndex + 1
    if (nextIndex < displaySlides.length) {
      setCurrentSlideId(displaySlides[nextIndex].id)
    }

    setLastProgress(0) // Reset progress tracking for new video

    // Allow progression again after a short delay
    if (resetRef.current != null) clearTimeout(resetRef.current)
    resetRef.current = setTimeout(() => {
      setIsProgressing(false)
    }, 2000)
  }, [
    moveToNext,
    autoProgressEnabled,
    isProgressing,
    displaySlides,
    currentIndex
  ])

  // Effect to detect video end and progress immediately
  useEffect(() => {
    // Check if video has ended (progress >= 95%)
    if (playerState.progress >= 95 && lastProgress < 95 && !isProgressing) {
      progressToNextVideo()
    }
    setLastProgress(playerState.progress)
  }, [playerState.progress, lastProgress, progressToNextVideo, isProgressing])

  // Get the active video for playback (current slide from carousel)
  // Transform CarouselVideo or MuxSlide to VideoContentFields for VideoProvider
  const activeVideo: VideoContentFields | null = useMemo(() => {
    if (!currentSlide) {
      return null
    }

    // Handle mux inserts
    if (isMuxSlide(currentSlide)) {
      const muxSlide = currentSlide
      return {
        __typename: 'Video' as const,
        id: muxSlide.id,
        slug: muxSlide.id,
        title: [
          {
            __typename: 'VideoTitle' as const,
            value: muxSlide.overlay.title
          }
        ],
        images: [
          {
            __typename: 'CloudflareImage' as const,
            mobileCinematicHigh: muxSlide.urls.poster
          }
        ],
        imageAlt: [
          {
            __typename: 'VideoImageAlt' as const,
            value: muxSlide.overlay.title
          }
        ],
        snippet: [],
        description: [
          {
            __typename: 'VideoDescription' as const,
            value: muxSlide.overlay.description
          }
        ],
        studyQuestions: [],
        bibleCitations: [],
        label: muxSlide.overlay.label as any,
        variant: {
          __typename: 'VideoVariant' as const,
          id: `${muxSlide.id}-variant`,
          duration: 0, // We don't have duration for mux videos
          hls: muxSlide.urls.hls,
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
          slug: `${muxSlide.id}/variant`,
          subtitleCount: 0
        },
        variantLanguagesCount: 1,
        childrenCount: 0
      }
    }

    // Handle regular videos
    const video = currentSlide.video as any
    if (!video) {
      return null
    }

    const title = (video.title ?? []).map((t) => ({
      __typename: 'VideoTitle' as const,
      value: t.value
    }))

    const images = (video.images ?? []).map((img) => ({
      __typename: 'CloudflareImage' as const,
      mobileCinematicHigh: img.mobileCinematicHigh
    }))

    const imageAlt = (video.imageAlt ?? []).map((alt) => ({
      __typename: 'VideoImageAlt' as const,
      value: alt.value
    }))

    const snippet = []
    const description = (video.description ?? []).map((desc) => ({
      __typename: 'VideoDescription' as const,
      value: desc.value
    }))
    const studyQuestions = []
    const bibleCitations = []

    const variant =
      video.variant &&
      video.variant.id &&
      video.variant.duration !== undefined &&
      video.variant.hls &&
      video.variant.slug
        ? {
            __typename: 'VideoVariant' as const,
            id: video.variant.id,
            duration: video.variant.duration,
            hls: video.variant.hls,
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
            slug: video.variant.slug,
            subtitleCount: 0
          }
        : null

    return {
      __typename: 'Video' as const,
      id: video.id,
      slug: video.slug,
      label:
        video.label &&
        Object.values(VideoLabel).includes(video.label as VideoLabel)
          ? (video.label as VideoLabel)
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
      childrenCount: video.childrenCount ?? 0
    }
  }, [currentSlide])

  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX ?? ''

  const handleMuxInsertComplete = useCallback(() => {
    if (!autoProgressEnabled || isProgressing || currentSlideIndex === -1) {
      return
    }

    const nextIndex = currentSlideIndex + 1
    const nextSlide = displaySlides[nextIndex]

    console.log('[DURATION] Mux insert completed - progressing to next slide')

    if (!nextSlide) {
      console.log('[DURATION] No next slide available after mux insert')
      return
    }

    console.log(
      `[DURATION] Moving to slide ${nextIndex}/${displaySlides.length}: ${nextSlide.source}:${nextSlide.id}`
    )

    setIsProgressing(true)
    setCurrentSlideId(nextSlide.id)

    if (!isMuxSlide(nextSlide)) {
      const jumped = jumpToVideo(nextSlide.id)
      if (!jumped) {
        console.warn(
          `[DURATION] Failed to sync to video ${nextSlide.id}, falling back to next video`
        )
        moveToNext()
      }
    }

    if (resetRef.current != null) clearTimeout(resetRef.current)
    resetRef.current = setTimeout(() => {
      setIsProgressing(false)
    }, 500)
  }, [
    autoProgressEnabled,
    currentSlideIndex,
    isProgressing,
    jumpToVideo,
    moveToNext,
    displaySlides
  ])

  useEffect(() => {
    if (displaySlides.length === 0 || currentSlideIndex === -1) return

    const slideType = currentSlide?.source ?? 'unknown'
    const slideId = currentSlide?.id ?? 'none'

    console.log(
      `[DURATION] Current slide ${currentSlideIndex + 1}/${displaySlides.length}: ${slideType}:${slideId}`
    )

    if (currentMuxInsert) {
      console.log(
        `[DURATION] Active Mux insert: ${currentMuxInsert.id} (${currentMuxInsert.duration}s)`
      )
    }
  }, [currentMuxInsert, currentSlide, currentSlideIndex, displaySlides.length])

  return (
    <div>
      <VideoProvider value={{ content: activeVideo }}>
        <VideoContentHero
          isPreview={true}
          currentMuxInsert={currentMuxInsert}
          onMuxInsertComplete={handleMuxInsertComplete}
        />
      </VideoProvider>

      <ContentPageBlurFilter>
        <div className="pt-4">
          <VideoCarousel
            slides={displaySlides}
            activeVideoId={activeVideoId}
            loading={loading}
            onVideoSelect={(videoId: string) => {
              // Check if this is a mux insert
              const selectedSlide = displaySlides.find(
                (slide) => slide.id === videoId
              )
              if (selectedSlide && isMuxSlide(selectedSlide)) {
                // For mux inserts, set the current slide ID
                setCurrentSlideId(videoId)
                setIsProgressing(false)
              } else {
                // For regular videos, set the current slide ID and use jump logic
                setCurrentSlideId(videoId)
                const success = jumpToVideo(videoId)
                if (success) {
                  setIsProgressing(false)
                  // Note: activeVideoId will be automatically updated by the currentVideo sync effect
                } else {
                  // If jump failed, still keep the slide selected for UI consistency
                }
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
            <Index indexName={indexName}>
              <Box sx={{ pb: 10 }}>
                <SearchBarProvider>
                  <SearchBar showDropdown showLanguageButton />
                </SearchBarProvider>
              </Box>
              <AlgoliaVideoGrid variant="contained" languageId={languageId} />
            </Index>
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
