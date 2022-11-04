import { ReactElement } from 'react'
import { GetStaticProps } from 'next'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { gql } from '@apollo/client'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeName, ThemeMode } from '@core/shared/ui/themes'

import { HomeHero } from '../src/components/Hero'
import { PageWrapper } from '../src/components/PageWrapper'
import { Footer } from '../src/components/Footer/Footer'
import { HomeVideo, HomeVideos } from '../src/components/HomeVideos/HomeVideos'
import { FilmType } from '../src/components/HomeVideos/Card/HomeVideoCard'
import { Header } from '../src/components/Header'
import { createApolloClient } from '../src/libs/client'
import { GetHomeVideos } from '../__generated__/GetHomeVideos'

export const videos: HomeVideo[] = [
  {
    id: '1_jf-0-0',
    designation: FilmType.feature
  },
  { id: '2_ChosenWitness', designation: FilmType.animation },
  { id: '2_GOJ-0-0', designation: FilmType.feature },
  { id: 'MAG1', designation: FilmType.feature },
  { id: '1_fj-0-0', designation: FilmType.series },
  {
    id: '1_riv-0-0',
    designation: FilmType.series
  },
  { id: '1_wjv-0-0', designation: FilmType.series },
  { id: '2_Acts-0-0', designation: FilmType.feature },
  { id: '1_cl-0-0', designation: FilmType.series },
  { id: '3_0-40DWJ', designation: FilmType.collection },
  { id: '1_wl7-0-0', designation: FilmType.series }
]

interface HomePageProps {
  data: GetHomeVideos
}

function HomePage({ data }: HomePageProps): ReactElement {
  return (
    <PageWrapper header={<Header />} footer={<Footer />}>
      <ThemeProvider
        nested
        themeName={ThemeName.website}
        themeMode={ThemeMode.dark}
      >
        <HomeHero />
        <Box
          sx={{ paddingY: '4rem', backgroundColor: 'primary.backgroundColor' }}
        >
          <Container
            sx={{
              maxWidth: '100% !important',
              width: '100%',
              paddingLeft: '100px !important',
              paddingRight: '100px !important'
            }}
          >
            <HomeVideos data={data?.videosById} videos={videos} />
          </Container>
        </Box>
      </ThemeProvider>
    </PageWrapper>
  )
}

export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
  const apolloClient = createApolloClient()
  const { data } = await apolloClient.query<GetHomeVideos>({
    query: gql`
      query GetHomeVideos($ids: [ID!]!, $languageId: ID) {
        videosById(ids: $ids) {
          id
          type
          image
          title(languageId: $languageId, primary: true) {
            value
          }
          variant {
            duration
          }
          episodeIds
          slug(languageId: $languageId, primary: true) {
            value
          }
        }
      }
    `,
    variables: {
      ids: videos.map((video) => video.id),
      languageId: '529'
    }
  })

  if (data.videosById === null) {
    return {
      props: {},
      notFound: true,
      revalidate: 60
    }
  } else {
    return {
      props: {
        data
      },
      revalidate: 60
    }
  }
}
export default HomePage
