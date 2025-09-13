import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import {
  type ReactElement,
  useCallback,
  useEffect,
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
    currentIndex,
    loading,
    moveToNext,
    moveToPrevious,
    jumpToVideo,
    currentPoolIndex
  } = useCarouselVideos('529') // Use language ID 529 for now
  const [autoProgressEnabled, setAutoProgressEnabled] = useState(true)

  // Map videos to ensure data structure matches what VideoCard expects
  const carouselVideos = videos.map((video) => ({
    ...video,
    // Ensure the data structure matches what VideoCard expects
    title: video.title || [{ value: video.videoTitle || video.slug }],
    images: video.images || [],
    imageAlt: video.imageAlt || [{ value: video.videoTitle || video.slug }],
    label: video.label || video.videoLabel || 'video'
  }))

  // Get current video from videos array using currentIndex
  const currentVideo = videos[currentIndex] || null

  const { state: playerState } = usePlayer()
  const [lastProgress, setLastProgress] = useState(0)
  const [isProgressing, setIsProgressing] = useState(false)

  // Set the current video as active
  useEffect(() => {
    if (currentVideo && currentVideo.id !== activeVideoId) {
      setActiveVideoId(currentVideo.id)
    }
  }, [currentVideo, activeVideoId])

  // Reset progress tracking when video changes
  useEffect(() => {
    setLastProgress(0)
    // Add a delay before allowing progression again to ensure player state is reset
    setTimeout(() => {
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
    setTimeout(() => {
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
  const activeVideo = currentVideo

  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX ?? ''

  return (
    <div>
      <VideoProvider value={{ content: activeVideo }}>
        <VideoContentHero isPreview={true} />

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
                } else {
                  console.warn('Failed to jump to video:', videoId)
                }
              }}
              onSlideChange={(activeIndex: number) => {
                // Note: Slide changes in the carousel don't directly affect video playback
                // Video playback is controlled by the useCarouselVideos hook
                console.log('Carousel slide changed to index:', activeIndex)
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
      </VideoProvider>
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
