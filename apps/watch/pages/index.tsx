import { ReactElement } from 'react'
import { GetStaticProps } from 'next'
import Box from '@mui/material/Box'
import { gql } from '@apollo/client'

import { HomeHero } from '../src/components/Hero'
import { PageWrapper } from '../src/components/PageWrapper'
import { HomeVideo, HomeVideos } from '../src/components/HomeVideos'
import { FilmType } from '../src/components/HomeVideos/Card'
import { createApolloClient } from '../src/libs/client'
import { GetHomeVideo } from '../__generated__/GetHomeVideo'

export const GET_HOME_VIDEO = gql`
  query GetHomeVideo($id: ID!, $languageId: ID) {
    video(id: $id) {
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
`

export const videos: HomeVideo[] = [
  {
    id: '1_jf-0-0',
    designation: FilmType.feature
  },
  { id: '2_GOJ-0-0', designation: FilmType.feature },
  { id: '1_jf6119-0-0', designation: FilmType.feature },
  { id: '1_wl604423-0-0', designation: FilmType.feature },
  { id: 'MAG1', designation: FilmType.feature },
  { id: '1_wl7-0-0', designation: FilmType.series },
  { id: '3_0-8DWJ-WIJ_06-0-0', designation: FilmType.feature },
  { id: '2_Acts-0-0', designation: FilmType.feature },
  { id: '2_GOJ4904-0-0', designation: FilmType.feature },
  // TODO: LUMO collection goes here
  { id: '2_Acts7331-0-0', designation: FilmType.feature },
  { id: '3_0-8DWJ-WIJ', designation: FilmType.feature },
  { id: '2_ChosenWitness', designation: FilmType.animation },
  // TODO: LUMO collection gospel of luke here
  { id: '1_cl1309-0-0', designation: FilmType.feature },
  { id: '1_jf6102-0-0', designation: FilmType.feature },
  { id: '2_0-FallingPlates', designation: FilmType.series },
  { id: '2_Acts7345-0-0', designation: FilmType.feature },
  { id: '1_mld-0-0', designation: FilmType.feature },
  { id: '1_jf6101-0-0', designation: FilmType.feature }
]

interface HomePageProps {
  data: GetHomeVideo[]
}

function HomePage({ data }: HomePageProps): ReactElement {
  return (
    <PageWrapper hero={<HomeHero />}>
      <Box sx={{ paddingY: '4rem' }}>
        <HomeVideos data={data?.map(({ video }) => video)} videos={videos} />
      </Box>
    </PageWrapper>
  )
}

export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
  const apolloClient = createApolloClient()
  // unfortunately we have to grab videos individually. Getting them in batch causes out of memory issues
  // TODO: replace once we migrate off arangodb
  const { data: video0 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videos[0].id,
      languageId: '529'
    }
  })
  const { data: video1 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videos[1].id,
      languageId: '529'
    }
  })
  const { data: video2 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videos[2].id,
      languageId: '529'
    }
  })
  const { data: video3 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videos[3].id,
      languageId: '529'
    }
  })
  const { data: video4 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videos[4].id,
      languageId: '529'
    }
  })
  const { data: video5 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videos[5].id,
      languageId: '529'
    }
  })
  const { data: video6 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videos[6].id,
      languageId: '529'
    }
  })
  const { data: video7 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videos[7].id,
      languageId: '529'
    }
  })
  const { data: video8 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videos[8].id,
      languageId: '529'
    }
  })
  const { data: video9 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videos[9].id,
      languageId: '529'
    }
  })
  const { data: video10 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videos[10].id,
      languageId: '529'
    }
  })
  const { data: video11 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videos[11].id,
      languageId: '529'
    }
  })
  const { data: video12 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videos[12].id,
      languageId: '529'
    }
  })
  const { data: video13 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videos[13].id,
      languageId: '529'
    }
  })
  const { data: video14 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videos[14].id,
      languageId: '529'
    }
  })
  const { data: video15 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videos[15].id,
      languageId: '529'
    }
  })
  const { data: video16 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videos[16].id,
      languageId: '529'
    }
  })
  const { data: video17 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videos[17].id,
      languageId: '529'
    }
  })
  const { data: video18 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videos[12].id,
      languageId: '529'
    }
  })
  const data = [
    video0,
    video1,
    video2,
    video3,
    video4,
    video5,
    video6,
    video7,
    video8,
    video9,
    video10,
    video11,
    video12,
    video13,
    video14,
    video15,
    video16,
    video17,
    video18
  ]

  if (data.find((item) => item.video == null) == null) {
    return {
      props: {
        data
      },
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
