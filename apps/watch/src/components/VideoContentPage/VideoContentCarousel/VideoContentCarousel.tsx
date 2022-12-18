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

export function VideoContentCarousel(): ReactElement {
  const { id, label, slug, children, container } = useVideo()
  const { query } = useRouter()

  /* 
    TODO: 
    - Add border based on themeMode
    - Fix height of card images
    - Fix nav overlay preventing nav
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
    ${container.children.findIndex((child) => child.id === id) + 1} of ${
            container.children.length
          }`
        default:
          return ''
      }
    }
  }, [id, label, container])

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

  const relatedVideos = useMemo(
    () => [...siblings, [...children]],
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
                <Typography variant="overline1" color="secondary">
                  {progressionLabel}
                </Typography>
              </Typography>
              <NextLink
                href={`/${
                  container?.slug != null
                    ? `${container.slug}/${query.part3 as string}`
                    : ''
                }`}
                passHref
              >
                <Button variant="outlined" size="small" color="secondary">
                  {buttonLabel}
                </Button>
              </NextLink>
            </Stack>
          </Container>
        )}
        {container != null && container.children.length > 0 ? (
          <VideosCarousel
            videos={relatedVideos}
            activeVideo={id}
            renderItem={(props: Parameters<typeof VideoCard>[0]) => {
              return <VideoCard {...props} containerSlug={container.slug} />
            }}
          />
        ) : (
          children.length > 0 && (
            <VideosCarousel
              videos={children}
              activeVideo={id}
              renderItem={(props: Parameters<typeof VideoCard>[0]) => {
                return <VideoCard {...props} containerSlug={slug} />
              }}
            />
          )
        )}
      </Stack>
    </ThemeProvider>
  )
}
