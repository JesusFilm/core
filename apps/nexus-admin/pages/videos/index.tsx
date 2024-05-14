import { gql } from '@apollo/client'
import Stack from '@mui/material/Stack'
import { InferGetServerSidePropsType } from 'next'
import { AuthAction, withUser, withUserTokenSSR } from 'next-firebase-auth'
import { ReactElement } from 'react'

import { VIDEO_CHILD_FIELDS } from '@core/watch/ui/videoChildFields'
import { VideoGrid } from '@core/watch/ui/VideoGrid'

import { GetHomeVideos } from '../../__generated__/GetHomeVideos'
import { createApolloClient } from '../../src/libs/apolloClient'

type VideosPageProps = InferGetServerSidePropsType<typeof getServerSideProps>

export const GET_HOME_VIDEOS = gql`
  ${VIDEO_CHILD_FIELDS}
  query GetHomeVideos($languageId: ID, $limit: Int, $offset: Int) {
    videos(limit: $limit, offset: $offset) {
      ...VideoChildFields
    }
  }
`

function VideosPage({ videos }: VideosPageProps): ReactElement {
  return (
    // TO DO: add edmonds page wrapper and side nav bar
    <Stack sx={{ p: 20 }}>
      <VideoGrid videos={videos} />
    </Stack>
  )
}

export const getServerSideProps = withUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ user }) => {
  const token = await user?.getIdToken()

  const apolloClient = createApolloClient(token ?? undefined)

  const { data } = await apolloClient.query<GetHomeVideos>({
    query: VIDEO_CHILD_FIELDS,
    variables: { limit: 50, offset: 0 }
  })

  return {
    props: {
      token,
      videos: data.videos,
      initialApolloState: apolloClient.cache.extract()
    }
  }
})

export default withUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(VideosPage)
