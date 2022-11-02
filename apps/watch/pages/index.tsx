import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { useQuery } from '@apollo/client'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeName, ThemeMode } from '@core/shared/ui/themes'

import { HomeHero } from '../src/components/Hero'
import { GET_VIDEOS } from '../src/components/Videos/Videos'
import { PageWrapper } from '../src/components/PageWrapper'

import {
  LanguageProvider,
  useLanguage
} from '../src/libs/languageContext/LanguageContext'
import { Footer } from '../src/components/Footer/Footer'
import { HomeVideo, HomeVideos } from '../src/components/HomeVideos/HomeVideos'
import { GetVideos } from '../__generated__/GetVideos'
import { designationTypes } from '../src/components/HomeVideos/Card/HomeVideoCard'
import { Header } from '../src/components/Header'

export const videos: HomeVideo[] = [
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

function HomePage(): ReactElement {
  const languageContext = useLanguage()
  const { data, loading, error } = useQuery<GetVideos>(GET_VIDEOS, {
    variables: {
      where: { ids: videos.map((video) => video.id) },
      languageId: languageContext?.id ?? '529'
    }
  })

  return (
    <PageWrapper header={<Header />} footer={<Footer isHome />}>
      <ThemeProvider
        nested
        themeName={ThemeName.website}
        themeMode={ThemeMode.dark}
      >
        <HomeHero />
      </ThemeProvider>
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
          <HomeVideos data={data?.videos} videos={videos} />
        </Container>
      </Box>
      <Footer isHome />
    </PageWrapper>
  )
}

export default HomePage
