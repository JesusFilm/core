import { ReactElement } from 'react'
import { gql, useQuery } from '@apollo/client'
import {
  AuthAction,
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { addApolloState, initializeApollo } from '../src/libs/apolloClient'
import { GetJourneys } from '../__generated__/GetJourneys'
import { JourneyList } from '../src/components/JourneyList'
import { PageWrapper } from '../src/components/PageWrapper'

const GET_JOURNEYS = gql`
  query GetJourneys {
    journeys: adminJourneys {
      id
      title
      createdAt
      publishedAt
      description
      slug
      themeName
      themeMode
      locale
      status
      userJourneys {
        id
        user {
          id
          firstName
          lastName
          imageUrl
        }
      }
    }
  }
`

function IndexPage(): ReactElement {
  const { data } = useQuery<GetJourneys>(GET_JOURNEYS)
  const AuthUser = useAuthUser()

  return (
    <>
      <NextSeo title="Journeys" />
      <PageWrapper title="Journeys" AuthUser={AuthUser}>
        {<JourneyList journeys={data?.journeys} />}
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
  // await apolloClient.query({
  //   query: GET_JOURNEYS
  // })
  return addApolloState(apolloClient, {
    props: {}
  })
})

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(IndexPage)
