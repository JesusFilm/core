import { ReactElement } from 'react'
import { gql, useQuery } from '@apollo/client'
import {
  AuthAction,
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import { addApolloState, initializeApollo } from '../src/libs/apolloClient'
import { GetJourneys } from '../__generated__/GetJourneys'
import { JourneyList } from '../src/components/JourneyList'
import { PageWrapper } from '../src/components/PageWrapper'
import { INVITE_USER_MODAL_FIELDS } from '../src/components/InviteUserModal'

const GET_JOURNEYS = gql`
  ${INVITE_USER_MODAL_FIELDS}
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
        ...InviteUserModalFields
      }
    }
  }
`

function IndexPage(): ReactElement {
  const { data } = useQuery<GetJourneys>(GET_JOURNEYS)
  const AuthUser = useAuthUser()

  return (
    <PageWrapper title="Journeys" AuthUser={AuthUser}>
      {data?.journeys != null && <JourneyList journeys={data.journeys} />}
    </PageWrapper>
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
