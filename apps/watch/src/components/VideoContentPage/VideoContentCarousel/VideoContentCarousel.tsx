import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeName, ThemeMode } from '@core/shared/ui/themes'
import { useRouter } from 'next/router'
import NextLink from 'next/link'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { ReactElement, useMemo } from 'react'

import { VideoLabel } from '../../../../__generated__/globalTypes'
import { useVideo } from '../../../libs/videoContext'
import { VideosCarousel } from '../../VideosCarousel'
import { getLabelDetails } from '../../../libs/utils/getLabelDetails/getLabelDetails'
import { VideoCard } from '../../VideoCard'

interface VideoContentCarouselProps {
  playing?: boolean
}

export function VideoContentCarousel({
  playing = false
}: VideoContentCarouselProps): ReactElement {
  const { title, id, slug, children, container } = useVideo()
  const router = useRouter()

  const activeVideoIndex = useMemo(() => {
    return container != null
      ? container.children.findIndex((child) => child.id === id) + 1
      : -1
  }, [container, id])

  /* 
    TODO: 
    - Scroll to active video fix
    - add tests
    */

  const progressionLabel = useMemo(() => {
    if (container != null) {
      switch (container.label) {
        case VideoLabel.collection:
          return `•  ${container.children.length} ${
            getLabelDetails(container.label).childLabel
          }`
        case VideoLabel.featureFilm:
        case VideoLabel.series:
          return `•  ${getLabelDetails(container.label).childLabel} 
    ${activeVideoIndex} of ${container.children.length}`
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

  const relatedVideos = useMemo(
    () => (children.length > 0 ? children.concat(siblings) : siblings),
    [siblings, children]
  )

  return (
    <ThemeProvider
      themeName={ThemeName.website}
      themeMode={ThemeMode.dark}
      nested
    >
      <Stack
        sx={{
          backgroundColor: 'background.default',
          color: 'text.primary',
          overflow: 'hidden',
          pt: 6,
          pb: 10
        }}
      >
        <Container maxWidth="xxl" sx={{ mb: 5 }}>
          <Typography
            variant="h5"
            color="text.primary"
            gutterBottom={container != null}
            sx={{ display: playing ? 'inline-flex' : 'none' }}
          >
            {title[0].value}
          </Typography>
          {container != null && (
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                data-testid="container-title"
                variant="overline1"
                color="primary"
              >
                {container.title[0].value}
                {'  '}
                <Typography
                  variant="overline1"
                  color="secondary"
                  sx={{ display: { xs: 'none', xl: 'inline-flex' } }}
                >
                  {progressionLabel}
                </Typography>
              </Typography>

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
                data-testid="container-progress"
                variant="overline1"
                color="secondary"
                sx={{ display: { xs: 'inline-flex', xl: 'none' } }}
              >
                {activeVideoIndex}/
                {container != null && relatedVideos.length > 0
                  ? relatedVideos.length
                  : children.length > 0
                  ? children.length
                  : 0}
              </Typography>
            </Stack>
          )}
        </Container>
        <VideosCarousel
          videos={relatedVideos}
          activeVideo={id}
          renderItem={(props: Parameters<typeof VideoCard>[0]) => {
            return (
              <VideoCard
                {...props}
                containerSlug={container != null ? container.slug : slug}
                imageSx={{
                  ...props.imageSx,
                  border: '1px solid rgba(255, 255, 255, .12)',
                  borderRadius: '9px'
                }}
              />
            )
          }}
        />
      </Stack>
    </ThemeProvider>
  )
}
