import { ReactElement } from 'react'

import {
  GetHomeVideos,
  GetHomeVideos_videos as Video
} from '../../../../__generated__/GetHomeVideos'
import { Videos } from '../../../components/VideosPage'
import { getApolloClient } from '../../../libs/apolloClient/apolloClient'
import { GET_HOME_VIDEOS } from '../grahql'

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

interface VideosPageProps {
  params: {
    languageId: string
  }
}

export default async function VideosPage({
  params
}: VideosPageProps): Promise<ReactElement> {
  const { data } = await getApolloClient().query<GetHomeVideos>({
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

  return <Videos languageId={params.languageId} videos={videos} />
}
