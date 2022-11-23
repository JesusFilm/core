import { ReactElement } from 'react'
import { GetStaticProps } from 'next'
import Box from '@mui/material/Box'
import { gql } from '@apollo/client'

import { HomeHero } from '../src/components/Hero'
import { PageWrapper } from '../src/components/PageWrapper'
import { HomeVideos } from '../src/components/HomeVideos'
import { createApolloClient } from '../src/libs/client'
import { GetHomeVideo } from '../__generated__/GetHomeVideo'
import { IntroText } from '../src/components/IntroText'

export const GET_HOME_VIDEO = gql`
  query GetHomeVideo($id: ID!, $languageId: ID) {
    video(id: $id) {
      id
      type
      subType
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

const videos = [
  '1_jf-0-0',
  '2_GOJ-0-0',
  '1_jf6119-0-0',
  '1_wl604423-0-0',
  'MAG1',
  '1_wl7-0-0',
  '3_0-8DWJ-WIJ_06-0-0',
  '2_Acts-0-0',
  '2_GOJ4904-0-0',
  'LUMOCollection',
  '2_Acts7331-0-0',
  '3_0-8DWJ-WIJ',
  '2_ChosenWitness',
  'GOLukeCollection',
  '1_cl1309-0-0',
  '1_jf6102-0-0',
  '2_0-FallingPlates',
  '2_Acts7345-0-0',
  '1_mld-0-0',
  '1_jf6101-0-0'
]

interface HomePageProps {
  data: GetHomeVideo[]
}

function HomePage({ data }: HomePageProps): ReactElement {
  return (
    <PageWrapper hero={<HomeHero />}>
      <Box sx={{ paddingY: '4rem' }}>
        <HomeVideos data={data?.map(({ video }) => video)} />
      </Box>
      <IntroText />
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
      id: videos[0],
      languageId: '529'
    }
  })
  const { data: video1 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videos[1],
      languageId: '529'
    }
  })
  const { data: video2 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videos[2],
      languageId: '529'
    }
  })
  const { data: video3 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videos[3],
      languageId: '529'
    }
  })
  const { data: video4 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videos[4],
      languageId: '529'
    }
  })
  const { data: video5 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videos[5],
      languageId: '529'
    }
  })
  const { data: video6 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videos[6],
      languageId: '529'
    }
  })
  const { data: video7 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videos[7],
      languageId: '529'
    }
  })
  const { data: video8 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videos[8],
      languageId: '529'
    }
  })
  const { data: video9 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videos[9],
      languageId: '529'
    }
  })
  const { data: video10 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videos[10],
      languageId: '529'
    }
  })
  const { data: video11 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videos[11],
      languageId: '529'
    }
  })
  const { data: video12 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videos[12],
      languageId: '529'
    }
  })
  const { data: video13 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videos[13],
      languageId: '529'
    }
  })
  const { data: video14 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videos[14],
      languageId: '529'
    }
  })
  const { data: video15 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videos[15],
      languageId: '529'
    }
  })
  const { data: video16 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videos[16],
      languageId: '529'
    }
  })
  const { data: video17 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videos[17],
      languageId: '529'
    }
  })
  const { data: video18 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videos[18],
      languageId: '529'
    }
  })
  const { data: video19 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videos[19],
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
    video18,
    video19
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
