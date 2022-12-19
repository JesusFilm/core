import { ApolloProvider, NormalizedCacheObject } from '@apollo/client'
import { GetStaticProps } from 'next'
import { ReactElement } from 'react'
import { Videos } from '../src/components/VideosPage'
import {
  defaultFilter,
  GET_VIDEOS,
  limit
} from '../src/components/VideosPage/VideosPage'
import { createApolloClient, useApolloClient } from '../src/libs/apolloClient'

interface VideosPageProps {
  initialApolloState: NormalizedCacheObject
}
function VideosPage({ initialApolloState }: VideosPageProps): ReactElement {
  const client = useApolloClient(undefined, initialApolloState)

  return (
    <ApolloProvider client={client}>
      <Videos />
    </ApolloProvider>
  )
}

export const getStaticProps: GetStaticProps<VideosPageProps> = async () => {
  const apolloClient = createApolloClient()
  await apolloClient.query({
    query: GET_VIDEOS,
    variables: {
      where: defaultFilter,
      offset: 0,
      limit,
      languageId: '529'
    }
  })
  return {
    props: {
      initialApolloState: apolloClient.cache.extract()
    },
    revalidate: 60
  }
}
export default VideosPage
