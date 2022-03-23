import { ReactElement } from 'react'
import {
  AuthAction,
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { addApolloState, initializeApollo } from '../src/libs/apolloClient'
import { PageWrapper } from '../src/components/PageWrapper'

function IndexPage(): ReactElement {
  const AuthUser = useAuthUser()

  return (
    <>
      <NextSeo title="Journeys" />
      <PageWrapper title="Journeys" AuthUser={AuthUser}>
        {data?.journeys != null && <JourneyList journeys={data.journeys} />}
      </PageWrapper>
    </>
  )
}

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ AuthUser }) => {
  const apolloClient = initializeApollo({
    token: (await AuthUser.getIdToken()) ?? ''
  })
  await apolloClient.query({
    query: GET_JOURNEYS
  })

  return addApolloState(apolloClient, {
    props: {}
  })
})

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(IndexPage)
