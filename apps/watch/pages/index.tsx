import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { useQuery } from '@apollo/client'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import OutlinedInput from '@mui/material/OutlinedInput'
import Search from '@mui/icons-material/Search'
import Button from '@mui/material/Button'
import Language from '@mui/icons-material/Language'
import Place from '@mui/icons-material/Place'
import Link from 'next/link'

import { GET_VIDEOS } from '../src/components/Videos/VideoList/VideoList'
import { PageWrapper } from '../src/components/PageWrapper'
import { theme } from '../src/components/ThemeProvider/ThemeProvider'
import {
  LanguageProvider,
  useLanguage
} from '../src/libs/languageContext/LanguageContext'
import { Footer } from '../src/components/Footer/Footer'
import {
  HomeVideo,
  HomeVideoList
} from '../src/components/HomeVideoList/HomeVideoList'
import { GetVideos } from '../__generated__/GetVideos'
import { designationTypes } from '../src/components/HomeVideoList/Card/HomeVideoCard'

const videos: HomeVideo[] = [
  {
    id: '1_jf-0-0',
    designation: designationTypes.feature
  },
  { id: '2_ChosenWitness', designation: designationTypes.animation },
  { id: '2_GOJ-0-0', designation: designationTypes.feature },
  { id: 'MAG1', designation: designationTypes.feature },
  { id: '1_fj-0-0', designation: designationTypes.series },
  {
    id: '1_riv-0-0',
    designation: designationTypes.series
  },
  { id: '1_wjv-0-0', designation: designationTypes.series },
  { id: '2_Acts-0-0', designation: designationTypes.feature },
  { id: '1_cl-0-0', designation: designationTypes.series },
  { id: '3_0-40DWJ', designation: designationTypes.collection },
  { id: '1_wl7-0-0', designation: designationTypes.series }
]

function VideoPage(): ReactElement {
  const languageContext = useLanguage()
  const { data, loading, error } = useQuery<GetVideos>(GET_VIDEOS, {
    variables: {
      where: { ids: videos.map((video) => video.id) },
      languageId: languageContext?.id ?? '529'
    }
  })

  return (
    <LanguageProvider>
      <PageWrapper />
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

      <Box sx={{ paddingY: '4rem', backgroundColor: '#131111' }}>
        <Container
          sx={{
            maxWidth: '100% !important',
            width: '100%',
            margin: 0,
            paddingLeft: '100px !important',
            paddingRight: '100px !important'
          }}
        >
          <HomeVideoList data={data?.videos} videos={videos} />
        </Container>
      </Box>
      <Footer isHome />
    </LanguageProvider>
  )
}

export default VideoPage
