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
import { videos } from '../../Videos/testData'

export function VideoContentCarousel(): ReactElement {
  const { id, label, slug, children, container } = useVideo()
  const router = useRouter()

  const activeVideoIndex = useMemo(() => {
    return container != null
      ? container.children.findIndex((child) => child.id === id) + 1
      : -1
  }, [container, id])

  /* 
    TODO: 
    - Scroll to active video fix
    - add tests & stories
    */

  const progressionLabel = useMemo(() => {
    if (container != null) {
      switch (label) {
        case VideoLabel.featureFilm:
        case VideoLabel.shortFilm:
          return `•  ${container.children.length} ${
            getLabelDetails(container.label).childLabel
          }`
        case VideoLabel.segment:
        case VideoLabel.episode:
          return `•  ${getLabelDetails(label).label} 
    ${activeVideoIndex} of ${container.children.length}`
        default:
          return ''
      }
    }
  }, [label, container, activeVideoIndex])

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
          return 'Open the whole collection'
        case VideoLabel.series:
          return 'Open the series'
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

  console.log('siblings', siblings, videos.length, children)

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
        {container != null && (
          <Container maxWidth="xxl">
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 6 }}
            >
              <Typography variant="overline1" color="primary">
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
          </Container>
        )}
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
