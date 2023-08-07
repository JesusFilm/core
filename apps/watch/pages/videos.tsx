import { NormalizedCacheObject } from '@apollo/client'
import { GetStaticProps } from 'next'
import { ReactElement } from 'react'

import {
  GetHomeVideos,
  GetHomeVideos_videos as Video
} from '../__generated__/GetHomeVideos'
import { Videos } from '../src/components/VideosPage'
import {
  GET_LANGUAGES,
  GET_VIDEOS,
  limit
} from '../src/components/VideosPage/VideosPage'
import { createApolloClient } from '../src/libs/apolloClient'

import { GET_HOME_VIDEOS } from './index'

interface VideosPageProps {
  initialApolloState: NormalizedCacheObject
}
function VideosPage({ videos }): ReactElement {
  return <Videos videos={videos} />
}

const videoIds = [
  '1_jf-0-0',
  '2_ChosenWitness',
  '2_GOJ-0-0',
  'MAG1',
  '1_cl-0-0',
  'Wonder',
  'Nua',
  'GoodStory',
  '2_FileZero-0-0',
  '1_fj-0-0',
  '1_riv-0-0',
  '1_wjv-0-0',
  '2_Acts-0-0',
  'CS1',
  'DWJ1',
  'LOJS',
  '1_cl13-0-0',
  '1_wl7-0-0',
  '2_0-UseThisApp',
  '2_0-LeaderImpact',
  'LUMOCollection'
]

export const getStaticProps: GetStaticProps<VideosPageProps> = async () => {
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

  await apolloClient.query({
    query: GET_VIDEOS,
    variables: {
      where: {},
      offset: 0,
      limit,
      languageId: '529'
    }
  })
  await apolloClient.query({
    query: GET_LANGUAGES,
    variables: {
      languageId: '529'
    }
  })

  return {
    revalidate: 3600,
    props: {
      initialApolloState: apolloClient.cache.extract(),
      videos
    }
  }
}
export default VideosPage
