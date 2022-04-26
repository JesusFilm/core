import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { useQuery, gql } from '@apollo/client'
import Fab from '@mui/material/Fab';
import { VideoList } from '../src/components/Videos/VideoList/VideoList'
import { PageWrapper } from '../src/components/PageWrapper'
import { GetVideoTag } from '../__generated__/GetVideoTag'
import { VideoType } from '../__generated__/globalTypes'

export const GET_VIDEO_TAG = gql`
  query GetVideoTag($id: ID!) {
    videoTag(id: $id) {
      id
      title {
        primary
        value
      }
    }
    videoTags {
      id
      title {
        primary
        value
      }
    }
  }
`

function VideoPage(): ReactElement {
  const { data: jfm1Data } = useQuery<GetVideoTag>(GET_VIDEO_TAG, {
    variables: {
      id: 'JFM1'
    }
  })
  return (
    <>
      <PageWrapper />
      <Box sx={{ bgcolor: '#fff' }}>
        <Container maxWidth="xl">
          <Grid
            container
            direction="row"
            justifyContent="start"
            alignItems="center"
            sx={{ minHeight: '50vh', paddingY: '5rem' }}
          >
            <Grid item>
              <Typography variant="h2">
                Equip a Team to Reach the Unreached With JESUS
              </Typography>
              <Typography variant="h4">
                You can reach people in their heart language with Jesus&apos;
                love and forgiveness and help change lives.
              </Typography>
            </Grid>
          </Grid>
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
            {jfm1Data?.videoTag?.title.find((t) => t.primary)?.value}
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
          <Typography variant="h2">
            Collections
          </Typography>
          <Grid
            container
            spacing={2}
            direction="row"
            justifyContent="start"
            alignItems="center"
            sx={{ paddingY: '1rem' }}
          >
            {jfm1Data?.videoTags?.map(item => 
              <Grid item key={item.id}>
                <Fab variant="extended" >
                  {item.title.find((t) => t.primary)?.value}
                </Fab>
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ bgcolor: '#cfe8fc', paddingY: '5rem' }}>
        <Container maxWidth="xl">
          {jfm1Data?.videoTags?.slice(0,3).map(item => 
            <Box key={item.id}>
              <Typography variant="h2">
                {item.title.find((t) => t.primary)?.value}
              </Typography>
              <VideoList
                filter={{
                  types: [VideoType.playlist, VideoType.standalone],
                  tagId: item.id
                }}
                limit={6}
                showLoadMore={false}
                layout="carousel"
              />
            </Box>
          )}
        </Container>
      </Box>
    </>
  )
}

export default VideoPage
