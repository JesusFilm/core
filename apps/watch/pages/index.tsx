import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { useQuery, gql } from '@apollo/client'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import OutlinedInput from '@mui/material/OutlinedInput'
import Search from '@mui/icons-material/Search'
import Button from '@mui/material/Button'
import Language from '@mui/icons-material/Language'
import Place from '@mui/icons-material/Place'
import Link from 'next/link'
import Chip from '@mui/material/Chip'

import { VideoList } from '../src/components/Videos/VideoList/VideoList'
import { PageWrapper } from '../src/components/PageWrapper'
import { GetVideoTag } from '../__generated__/GetVideoTag'
import { VideoType } from '../__generated__/globalTypes'
import { theme } from '../src/components/ThemeProvider/ThemeProvider'
import {
  LanguageProvider,
  useLanguage
} from '../src/libs/languageContext/LanguageContext'
import { Footer } from '../src/components/Footer/Footer'
import { Header } from '../src/components/Header'

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
      <PageWrapper header={<Header />} footer={<Footer isHome />}>
        <Box
          sx={{ backgroundImage: 'url(/images/jesus-header.png)', height: 776 }}
        >
          <Container
            maxWidth="xl"
            style={{
              paddingTop: 350,
              textShadow: '0px 3px 4px rgba(0, 0, 0, 0.25)',
              paddingLeft: 100,
              paddingRight: 100,
              margin: 0
            }}
          >
            <Stack direction="row" justifyContent="space-between" width="100%">
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
                  <u
                    style={{ textDecorationColor: theme.palette.primary.main }}
                  >
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

        <Box sx={{ paddingY: '4rem' }}>
          <Container
            sx={{
              maxWidth: '100% !important',
              width: '100%',
              margin: 0,
              paddingLeft: '100px !important',
              paddingRight: '100px !important'
            }}
          >
            <Stack direction="row" justifyContent="space-between" mb={3}>
              <Typography variant="h4">Series</Typography>
              <Button variant="outlined">See All</Button>
            </Stack>
            <VideoList
              filter={{
                availableVariantLanguageIds: ['529'],
                types: [VideoType.playlist]
              }}
              limit={6}
              showLoadMore={false}
              layout="carousel"
            />
          </Container>
        </Box>

        <Box sx={{ paddingY: '3rem' }}>
          <Container
            sx={{
              maxWidth: '100% !important',
              width: '100%',
              margin: 0,
              paddingLeft: '100px !important',
              paddingRight: '100px !important'
            }}
          >
            <Stack direction="row" justifyContent="space-between" mb={3}>
              <Typography variant="h4">
                {jfm1Data?.videoTag?.title[0]?.value}
              </Typography>
              <Button variant="outlined">See All</Button>
            </Stack>
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

        <Box sx={{ bgcolor: theme.palette.secondary.light, paddingY: '3rem' }}>
          <Container
            sx={{
              maxWidth: '100% !important',
              width: '100%',
              margin: 0,
              paddingLeft: '100px !important',
              paddingRight: '100px !important'
            }}
          >
            <Typography variant="h4" color="secondary">
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
              {jfm1Data?.videoTags?.map((item) => (
                <Grid item key={item.id}>
                  <Link href={`/videos/t/${item.id}`} passHref>
                    <Chip
                      label={item.title[0]?.value}
                      variant="outlined"
                      color="primary"
                    />
                  </Link>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      </PageWrapper>
    </LanguageProvider>
  )
}

export default VideoPage
