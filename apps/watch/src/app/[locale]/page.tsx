import { unstable_setRequestLocale } from 'next-intl/server'
import { ReactElement } from 'react'

import {
  GetHomeVideos,
  GetHomeVideos_videos as Video
} from '../../../__generated__/GetHomeVideos'
import { locales } from '../../../i18n'
import { HomePage } from '../../components/HomePage'
import { getApolloClient } from '../../libs/apolloClient/apolloClient'

import { GET_HOME_VIDEOS } from './grahql'
import { homeVideoIds } from './homeVideoIds'

export async function generateStaticParams(): Promise<
  Array<{ locale: string }>
> {
  return locales.map((locale) => ({ locale }))
}

export default async function Index({
  locale
}: {
  locale: string
}): Promise<ReactElement> {
  unstable_setRequestLocale(locale)
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
  return <HomePage videos={videos} />
}
