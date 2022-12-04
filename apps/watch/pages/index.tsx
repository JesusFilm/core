import { ReactElement } from 'react'
import { GetStaticProps } from 'next'
import Box from '@mui/material/Box'
import { gql } from '@apollo/client'

import { compact } from 'lodash'
import { HomeHero } from '../src/components/Hero'
import { PageWrapper } from '../src/components/PageWrapper'
import { HomeVideos } from '../src/components/HomeVideos'
import { createApolloClient } from '../src/libs/client'
import { GetHomeVideo } from '../__generated__/GetHomeVideo'
import { IntroText } from '../src/components/IntroText'
import { VideoContentFields } from '../__generated__/VideoContentFields'
import { VIDEO_CONTENT_FIELDS } from '../src/libs/videoContentFields'

export const GET_HOME_VIDEO = gql`
  ${VIDEO_CONTENT_FIELDS}
  query GetHomeVideo($id: ID!, $languageId: ID) {
    video(id: $id) {
      ...VideoContentFields
    }
  }
`

const videoIds = [
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
  videos: VideoContentFields[]
}

function HomePage({ videos }: HomePageProps): ReactElement {
  return (
    <PageWrapper hero={<HomeHero />}>
      <Box sx={{ paddingY: '4rem' }}>
        <HomeVideos data={videos} />
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
      id: videoIds[0],
      languageId: '529'
    }
  })
  const { data: video1 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videoIds[1],
      languageId: '529'
    }
  })
  const { data: video2 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videoIds[2],
      languageId: '529'
    }
  })
  const { data: video3 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videoIds[3],
      languageId: '529'
    }
  })
  const { data: video4 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videoIds[4],
      languageId: '529'
    }
  })
  const { data: video5 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videoIds[5],
      languageId: '529'
    }
  })
  const { data: video6 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videoIds[6],
      languageId: '529'
    }
  })
  const { data: video7 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videoIds[7],
      languageId: '529'
    }
  })
  const { data: video8 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videoIds[8],
      languageId: '529'
    }
  })
  const { data: video9 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videoIds[9],
      languageId: '529'
    }
  })
  const { data: video10 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videoIds[10],
      languageId: '529'
    }
  })
  const { data: video11 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videoIds[11],
      languageId: '529'
    }
  })
  const { data: video12 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videoIds[12],
      languageId: '529'
    }
  })
  const { data: video13 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videoIds[13],
      languageId: '529'
    }
  })
  const { data: video14 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videoIds[14],
      languageId: '529'
    }
  })
  const { data: video15 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videoIds[15],
      languageId: '529'
    }
  })
  const { data: video16 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videoIds[16],
      languageId: '529'
    }
  })
  const { data: video17 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videoIds[17],
      languageId: '529'
    }
  })
  const { data: video18 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videoIds[18],
      languageId: '529'
    }
  })
  const { data: video19 } = await apolloClient.query<GetHomeVideo>({
    query: GET_HOME_VIDEO,
    variables: {
      id: videoIds[19],
      languageId: '529'
    }
  })
  const videos = compact([
    video0.video,
    video1.video,
    video2.video,
    video3.video,
    video4.video,
    video5.video,
    video6.video,
    video7.video,
    video8.video,
    video9.video,
    video10.video,
    video11.video,
    video12.video,
    video13.video,
    video14.video,
    video15.video,
    video16.video,
    video17.video,
    video18.video,
    video19.video
  ])

  console.log(JSON.stringify(videos))
  return {
    props: {
      videos
    },
    revalidate: 60
  }
}
export default HomePage
