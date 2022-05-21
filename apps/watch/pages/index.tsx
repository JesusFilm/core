import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { useQuery, gql } from '@apollo/client'
import Fab from '@mui/material/Fab'
import Stack from '@mui/material/Stack'
import { VideoList } from '../src/components/Videos/VideoList/VideoList'
import { PageWrapper } from '../src/components/PageWrapper'
import { GetVideoTag } from '../__generated__/GetVideoTag'
import { VideoType } from '../__generated__/globalTypes'
import { theme } from '../src/components/ThemeProvider/ThemeProvider'
import {
  LanguageProvider,
  useLanguage
} from '../src/libs/languageContext/LanguageContext'

export const GET_VIDEO_TAG = gql`
  query GetVideoTag($id: ID!, $languageId: ID) {
    videoTag(id: $id) {
      id
      title(languageId: $languageId, primary: true) {
        value
      }
    }
    videoTags {
      id
      title(languageId: $languageId, primary: true) {
        value
      }
    }
  }
`

function VideoPage(): ReactElement {
  const languageContext = useLanguage()
  const { data: jfm1Data } = useQuery<GetVideoTag>(GET_VIDEO_TAG, {
    variables: {
      id: 'JFM1',
      languageId: languageContext?.id ?? '529'
    }
  })
  return (
    <LanguageProvider>
      <PageWrapper />
      <Box
        sx={{ backgroundImage: 'url(/images/jesus-header.png)', height: 776 }}
      >
        <Container maxWidth="xl" style={{ paddingTop: 350 }}>
          <Stack direction="row" justifyContent="space-between">
            <Box>
              <Typography
                variant="h2"
                color={theme.palette.secondary.contrastText}
              >
                Until Everyone
              </Typography>
              <Typography
                variant="h2"
                color={theme.palette.secondary.contrastText}
              >
                <u style={{ textDecorationColor: theme.palette.primary.main }}>
                  Sees Jesus
                </u>
                .
              </Typography>
            </Box>
            <Typography
              variant="h6"
              color={theme.palette.secondary.contrastText}
            >
              The story of the gospel in 78 videos in 1800 languages.
            </Typography>
          </Stack>
        </Container>
      </Box>

      <Box sx={{ bgcolor: '#333', paddingY: '5rem' }}>
        <Container maxWidth="xl">
          <Typography variant="h3" color="white">
            Series
          </Typography>
          <Typography variant="h5" color="white">
            Perfect for weekly groups!
          </Typography>
          <VideoList
            filter={{
              availableVariantLanguageIds: ['529'],
              types: [VideoType.playlist]
            }}
            limit={6}
            showLoadMore={false}
            layout="grid"
          />
        </Container>
      </Box>

      <Box sx={{ bgcolor: '#cfe8fc', paddingY: '5rem' }}>
        <Container maxWidth="xl">
          <Typography variant="h2">
            {jfm1Data?.videoTag?.title[0]?.value}
          </Typography>
          <VideoList
            filter={{
              availableVariantLanguageIds: ['529'],
              types: [VideoType.playlist, VideoType.standalone],
              tagId: 'JFM1'
            }}
            limit={6}
            showLoadMore={false}
            layout="carousel"
          />
        </Container>
      </Box>

      <Box sx={{ bgcolor: '#f7f7f7', paddingY: '5rem' }}>
        <Container maxWidth="xl">
          <Typography variant="h2">Collections</Typography>
          <Grid
            container
            spacing={2}
            direction="row"
            justifyContent="start"
            alignItems="center"
            sx={{ paddingY: '1rem' }}
          >
            {jfm1Data?.videoTags?.map((item) => (
              <Grid item key={item.id}>
                <Fab variant="extended">{item.title[0]?.value}</Fab>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ bgcolor: '#cfe8fc', paddingY: '5rem' }}>
        <Container maxWidth="xl">
          {jfm1Data?.videoTags?.slice(0, 3).map((item) => (
            <Box key={item.id}>
              <Typography variant="h2">{item.title[0]?.value}</Typography>
              <VideoList
                key={item.id}
                filter={{
                  types: [VideoType.playlist, VideoType.standalone],
                  tagId: item.id
                }}
                limit={6}
                showLoadMore={false}
                layout="carousel"
              />
            </Box>
          ))}
        </Container>
      </Box>
    </LanguageProvider>
  )
}

export default VideoPage
