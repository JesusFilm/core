import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { useQuery, gql } from '@apollo/client'
import Fab from '@mui/material/Fab'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import OutlinedInput from '@mui/material/OutlinedInput'
import Search from '@mui/icons-material/Search'
import Button from '@mui/material/Button'
import Language from '@mui/icons-material/Language'
import Place from '@mui/icons-material/Place'
import Link from 'next/link'

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
                sx={{ whiteSpace: 'nowrap' }}
              >
                Until Everyone
              </Typography>
              <Typography
                variant="h2"
                color={theme.palette.secondary.contrastText}
                sx={{ whiteSpace: 'nowrap' }}
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
              sx={{ opacity: 0.7, whiteSpace: 'nowrap' }}
            >
              The story of the gospel in 78 videos in 1800 languages.
            </Typography>
          </Stack>
        </Container>
        <Box
          sx={{ backgroundColor: 'rgba(18, 17, 17, 0.25)' }}
          width="100%"
          height="133px"
          mt="165px"
        >
          <Stack pt="34px" mx="100px" width="100%" direction="row">
            <OutlinedInput
              sx={{
                backgroundColor: '#F0F0F0',
                height: 64,
                width: 'calc(100vw - 600px)'
              }}
              placeholder="Keyword, Country or Language"
              endAdornment={
                <InputAdornment position="end">
                  <IconButton edge="end">
                    <Search />
                  </IconButton>
                </InputAdornment>
              }
            />
            <Stack direction="row">
              <Button
                variant="outlined"
                size="large"
                sx={{
                  background: 'transparent',
                  color: theme.palette.primary.contrastText,
                  borderColor: theme.palette.primary.contrastText,
                  height: 62,
                  marginX: 2
                }}
              >
                <Language />
                &nbsp;{languageContext?.name[0].value}
              </Button>
              <Link href="/countries" passHref>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    background: 'transparent',
                    color: theme.palette.primary.contrastText,
                    borderColor: theme.palette.primary.contrastText,
                    height: 62
                  }}
                >
                  <Place />
                  &nbsp;Language by country
                </Button>
              </Link>
            </Stack>
          </Stack>
        </Box>
      </Box>

      <Box sx={{ paddingY: '5rem' }}>
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
