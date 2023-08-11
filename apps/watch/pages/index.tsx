import { gql } from '@apollo/client'
import { GetStaticProps } from 'next'
import { ReactElement } from 'react'

import {
  GetHomeVideos,
  GetHomeVideos_videos as Video
} from '../__generated__/GetHomeVideos'
import { VideoChildFields } from '../__generated__/VideoChildFields'
import { HomePage as VideoHomePage } from '../src/components/HomePage'
import { createApolloClient } from '../src/libs/apolloClient'
import { VIDEO_CHILD_FIELDS } from '../src/libs/videoChildFields'

export const GET_HOME_VIDEOS = gql`
  ${VIDEO_CHILD_FIELDS}
  query GetHomeVideos($ids: [ID!]!, $languageId: ID) {
    videos(where: { ids: $ids }) {
      ...VideoChildFields
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
  '2_Acts7331-0-0',
  '3_0-8DWJ-WIJ',
  '2_ChosenWitness',
  'GOMattCollection',
  'GOMarkCollection',
  'GOLukeCollection',
  'GOJohnCollection',
  '1_cl1309-0-0',
  '1_jf6102-0-0',
  '2_0-FallingPlates',
  '2_Acts7345-0-0',
  '1_mld-0-0',
  '1_jf6101-0-0'
]

interface HomePageProps {
  videos: VideoChildFields[]
}

function HomePage({ videos }: HomePageProps): ReactElement {
  return <VideoHomePage videos={videos} />
}

export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
  const apolloClient = createApolloClient()
  const { data } = await apolloClient.query<GetHomeVideos>({
    query: GET_HOME_VIDEOS,
    variables: {
      ids: videoIds,
      languageId: '529'
    }
  })

  const videos: Video[] = []

  data.videos.forEach((video) => {
    videos[videoIds.indexOf(video.id)] = video
  })

  return {
    revalidate: 3600,
    props: {
      videos
    }
  }
}
export default HomePage
