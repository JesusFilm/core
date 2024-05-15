import Stack from '@mui/material/Stack'
import { InferGetServerSidePropsType } from 'next'
import { AuthAction, withUser, withUserTokenSSR } from 'next-firebase-auth'
import { ReactElement } from 'react'

import { VideoGrid } from '@core/watch/ui/VideoGrid'

import { GetHomeVideos } from '../../__generated__/GetHomeVideos'
import {
  GET_HOME_VIDEOS,
  VideosTable
} from '../../src/components/VideosTable/VideosTable'
import { createApolloClient } from '../../src/libs/apolloClient'

type VideosPageProps = InferGetServerSidePropsType<typeof getServerSideProps>

function VideosPage({ videos }: VideosPageProps): ReactElement {
  return (
    // TO DO: add edmonds page wrapper and side nav bar. make into paginated table?
    <Stack sx={{ p: 20 }}>
      <VideosTable />
      {/* <VideoGrid videos={videos} /> */}
    </Stack>
  )
}

export const getServerSideProps = withUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ user }) => {
  const token = await user?.getIdToken()

  const apolloClient = createApolloClient(token ?? undefined)

  const { data } = await apolloClient.query<GetHomeVideos>({
    query: GET_HOME_VIDEOS,
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
