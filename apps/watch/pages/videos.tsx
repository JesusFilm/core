import { NormalizedCacheObject } from '@apollo/client'
import { GetStaticProps } from 'next'
import { ReactElement } from 'react'
import { Videos } from '../src/components/VideosPage'
import {
  GET_LANGUAGES,
  GET_TITLES,
  GET_VIDEOS,
  limit
} from '../src/components/VideosPage/VideosPage'
import { createApolloClient } from '../src/libs/apolloClient'

interface VideosPageProps {
  initialApolloState: NormalizedCacheObject
}
function VideosPage(): ReactElement {
  return <Videos />
}

export const getStaticProps: GetStaticProps<VideosPageProps> = async () => {
  const apolloClient = createApolloClient()
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
  await apolloClient.query({
    query: GET_TITLES
  })

  return {
    revalidate: 3600,
    props: {
      initialApolloState: apolloClient.cache.extract()
    }
  }
}
export default VideosPage
