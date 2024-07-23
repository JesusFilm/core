import { NormalizedCacheObject, gql } from '@apollo/client'
import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { ReactElement } from 'react'

import { GET_LANGUAGES } from '@core/journeys/ui/useLanguagesQuery'

import {} from '../../__generated__/GetHomeVideos'
import i18nConfig from '../../next-i18next.config'
import { Videos } from '../../src/components/VideosPage'
import { createApolloClient } from '../../src/libs/apolloClient'
import { getFlags } from '../../src/libs/getFlags'
import { VIDEO_CHILD_FIELDS } from '../../src/libs/videoChildFields'

const GET_VIDEOS = gql`
  ${VIDEO_CHILD_FIELDS}
  query GetVideos(
    $where: VideosFilter
    $offset: Int
    $limit: Int
    $languageId: ID
  ) {
    videos(where: $where, offset: $offset, limit: $limit) {
      ...VideoChildFields
    }
  }
`

interface VideosPageProps {
  initialApolloState: NormalizedCacheObject
}

function VideosPage(): ReactElement {
  return <Videos />
}

export const getStaticProps: GetStaticProps<VideosPageProps> = async ({
  locale
}) => {
  const apolloClient = createApolloClient()

  await apolloClient.query({
    query: GET_VIDEOS,
    variables: {
      where: {},
      offset: 0,
      limit: 20,
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
      flags: await getFlags(),
      initialApolloState: apolloClient.cache.extract(),
      ...(await serverSideTranslations(
        locale ?? 'en',
        ['apps-watch'],
        i18nConfig
      ))
    }
  }
}
export default VideosPage
