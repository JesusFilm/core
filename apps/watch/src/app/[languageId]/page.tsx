import { ReactElement } from 'react'

import {
  GetHomeVideos,
  GetHomeVideos_videos as Video
} from '../../../__generated__/GetHomeVideos'
import { HomePage } from '../../components/HomePage'
import { getApolloClient } from '../../libs/apolloClient/apolloClient'
import { languages } from '../../libs/il8n/settings'

import { GET_HOME_VIDEOS } from './grahql'
import { homeVideoIds } from './homeVideoIds'

export async function generateStaticParams(): Promise<
  Array<{ languageId: string }>
> {
  return languages.map((languageId) => ({ languageId }))
}

interface HomePageProps {
  params: {
    languageId: string
  }
}
export default async function Index({
  params
}: HomePageProps): Promise<ReactElement> {
  const { data } = await getApolloClient().query<GetHomeVideos>({
    query: GET_HOME_VIDEOS,
    variables: {
      ids: homeVideoIds,
      languageId: '529'
    }
  })
  const videos: Video[] = []
  data.videos.forEach((video) => {
    videos[homeVideoIds.indexOf(video.id)] = video
  })
  return <HomePage languageId={params.languageId} videos={videos} />
}
