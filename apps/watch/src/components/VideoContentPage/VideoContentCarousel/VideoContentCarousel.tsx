import { ReactElement, useMemo } from 'react'
import { useRouter } from 'next/router'
import NextLink from 'next/link'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeName, ThemeMode } from '@core/shared/ui/themes'

import { VideoContentFields_children as VideoChildren } from '../../../../__generated__/VideoContentFields'
import { VideoLabel } from '../../../../__generated__/globalTypes'
import { useVideo } from '../../../libs/videoContext'
import { VideosCarousel } from '../../VideosCarousel'
import { getLabelDetails } from '../../../libs/utils/getLabelDetails/getLabelDetails'
import { VideoCard } from '../../VideoCard'
import { ShareButton } from '../../ShareButton'
import { DownloadButton } from '../DownloadButton'

interface VideoContentCarouselProps {
  playing?: boolean
  onShareClick: () => void
  onDownloadClick: () => void
}

export function VideoContentCarousel({
  playing = false,
  onShareClick,
  onDownloadClick
}: VideoContentCarouselProps): ReactElement {
  const { title, id, children, container, childrenCount } = useVideo()
  const router = useRouter()
  const theme = useTheme()

  const activeVideoIndex = useMemo(() => {
    return container != null
      ? container.children.findIndex((child) => child.id === id) + 1
      : -1
  }, [container, id])

  const progressionLabel = useMemo(() => {
    if (container != null) {
      switch (container.label) {
        case VideoLabel.collection:
          return `${getLabelDetails(
            container.label,
            container.childrenCount
          ).childCountLabel.toLowerCase()}`
        case VideoLabel.featureFilm:
        case VideoLabel.series:
          return `${getLabelDetails(container.label).childLabel} 
    ${activeVideoIndex} of ${container.childrenCount}`
        default:
          return ''
      }
    }
  }, [container, activeVideoIndex])

  const buttonLink =
    container != null && router != null
      ? `/${`${container.slug}/${router.query.part3 as string}`}`
      : ''

  const buttonLabel = useMemo(() => {
    if (container != null) {
      switch (container.label) {
        case VideoLabel.featureFilm:
          return 'Watch full film'
        case VideoLabel.collection:
        case VideoLabel.series:
          return 'See all'
        default:
          return ''
      }
    }
  }, [container])

  const siblings = useMemo(() => {
    if (container != null) {
      return (container?.children ?? []).filter((siblingVideo) => {
        return (
          children.findIndex(
            (childVideo) => childVideo.id === siblingVideo.id
          ) < 0
        )
      })
    }
    return []
  }, [container, children])

  const sortedChildren = useMemo(() => {
    const sorted: Array<VideoChildren | VideoChildren[]> = []
    const episodes: VideoChildren[] = []
    const segments: VideoChildren[] = []

    children.forEach((video) => {
      switch (video.label) {
        case VideoLabel.episode:
          if (episodes.length === 0) {
            sorted.push(episodes)
          }
          episodes.push(video)
          break
        case VideoLabel.segment:
          if (segments.length === 0) {
            sorted.push(segments)
          }
          segments.push(video)
          break
        default:
          sorted.push(video)
          break
      }
    })

    return sorted
  }, [children])

  const relatedVideos = useMemo(
    () =>
      sortedChildren.length > 0 ? sortedChildren.concat(siblings) : siblings,
    [siblings, sortedChildren]
  )

  return (
    <ThemeProvider
      themeName={ThemeName.website}
      themeMode={ThemeMode.dark}
      nested
    >
      <Stack
        sx={{
          display:
            playing || (container != null && relatedVideos.length > 0)
              ? 'inline-flex'
              : 'none',
          width: '100%',
          overflow: 'hidden',
          backgroundColor: 'background.default',
          color: 'text.primary',
          pt: 6,
          pb: 10
        }}
      >
        <Container maxWidth="xxl" sx={{ mb: relatedVideos.length > 0 ? 5 : 0 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              display: playing ? 'inline-flex' : 'none',
              width: '100%',
              mb: 4
            }}
          >
            <Typography
              variant="h5"
              color="text.primary"
              gutterBottom={container != null}
            >
              {title[0].value}
            </Typography>
            <Stack
              direction="row"
              sx={{ display: { xs: 'inline-flex', xl: 'none' }, ml: 4 }}
            >
              <ShareButton variant="icon" onClick={onShareClick} />
              <DownloadButton variant="icon" onClick={onDownloadClick} />
            </Stack>
          </Stack>
          {container != null && (
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack direction="row" alignItems="center">
                <NextLink href={buttonLink} passHref>
                  <Button
                    variant="text"
                    color="primary"
                    sx={{ ...theme.typography.overline1, px: 1, py: 0 }}
                  >
                    {container.title[0].value}
                  </Button>
                </NextLink>
                <Typography
                  variant="overline1"
                  color="secondary"
                  sx={{ display: { xs: 'none', xl: 'inline-flex' }, ml: 5 }}
                >
                  •
                  <Typography
                    data-testid="container-progress"
                    variant="overline1"
                    color="secondary"
                    sx={{ ml: 6 }}
                  >
                    {progressionLabel}
                  </Typography>
                </Typography>
              </Stack>
              <NextLink href={buttonLink} passHref>
                <Button
                  variant="outlined"
                  size="small"
                  color="secondary"
                  sx={{ display: { xs: 'none', xl: 'inline-flex' } }}
                >
                  {buttonLabel}
                </Button>
              </NextLink>
              <Typography
                data-testid="container-progress-short"
                variant="overline1"
                color="secondary"
                sx={{ display: { xs: 'inline-flex', xl: 'none' } }}
              >
                {activeVideoIndex}/
                {container != null && relatedVideos.length > 0
                  ? relatedVideos.length
                  : childrenCount > 0
                  ? childrenCount
                  : 0}
              </Typography>
            </Stack>
          )}
        </Container>
        {container != null && (
          <VideosCarousel
            videos={relatedVideos}
            activeVideo={id}
            renderItem={(props: Parameters<typeof VideoCard>[0]) => {
              return (
                <VideoCard
                  {...props}
                  containerSlug={container.slug}
                  imageSx={{
                    ...props.imageSx,
                    border: '1px solid rgba(255, 255, 255, .12)',
                    borderRadius: '9px'
                  }}
                />
              )
            }}
          />
        )}
      </Stack>
    </ThemeProvider>
  )
}
