import { ReactElement } from 'react'
import { gql, useQuery } from '@apollo/client'
import Head from 'next/head'
import { BLOCK_FIELDS } from '@core/journeys/ui'
import { useRouter } from 'next/router'
import {
  AuthAction,
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import { JourneyInvite } from '../../src/components/JourneyInvite/JourneyInvite'
import { INVITE_USER_MODAL_FIELDS } from '../../src/components/InviteUserModal'
import { GetJourney } from '../../__generated__/GetJourney'
import { JourneyProvider } from '../../src/components/JourneyView/Context'
import { JourneyView } from '../../src/components/JourneyView'
import { addApolloState, initializeApollo } from '../../src/libs/apolloClient'
import { PageWrapper } from '../../src/components/PageWrapper'
import { Menu } from '../../src/components/JourneyView/Menu'

const GET_JOURNEY = gql`
  ${BLOCK_FIELDS}
  ${INVITE_USER_MODAL_FIELDS}
  query GetJourney($id: ID!) {
    journey: adminJourney(id: $id, idType: slug) {
      id
      slug
      title
      description
      status
      locale
      createdAt
      publishedAt
      blocks {
        ...BlockFields
      }
      primaryImageBlock {
        src
      }
      userJourneys {
        id
        userId
        journeyId
        role
        user {
          ...InviteUserModalFields
        }
      }
    }
  }
`

function JourneySlugPage(): ReactElement {
  const router = useRouter()
  const AuthUser = useAuthUser()
  const { data, error } = useQuery<GetJourney>(GET_JOURNEY, {
    variables: { id: router.query.journeySlug }
  })

  return (
    <>
      {data?.journey != null && (
        <>
          <Head>
            <title>{data.journey.title}</title>
          </Head>
          <JourneyProvider value={data.journey}>
            <PageWrapper
              title="Journey Details"
              showDrawer
              backHref="/"
              Menu={<Menu />}
              AuthUser={AuthUser}
            >
              <JourneyView />
            </PageWrapper>
          </JourneyProvider>
        </>
      )}
      {error?.graphQLErrors[0].message ===
        'User has not received an invitation to edit this journey.' && (
        <>
          <Head>
            <title>Access Denied</title>
          </Head>
          <JourneyInvite journeySlug={router.query.journeySlug as string} />
        </>
      )}
      {error?.graphQLErrors[0].message === 'User invitation pending.' && (
        <>
          <Head>
            <title>Access Denied</title>
          </Head>
          <JourneyInvite
            journeySlug={router.query.journeySlug as string}
            requestReceived
          />
        </>
      )}
    </>
  )
}

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ AuthUser, query }) => {
  const apolloClient = initializeApollo({
    token: (await AuthUser.getIdToken()) ?? ''
  })

  try {
    await apolloClient.query({
      query: GET_JOURNEY,
      variables: {
        id: query.journeySlug
      }
    })
  } catch (error) {
    if (error.graphQLErrors[0].extensions.code === 'FORBIDDEN') {
      return addApolloState(apolloClient, {
        props: {}
      })
    }
    throw error
  }

  return addApolloState(apolloClient, {
    props: {}
  })
})

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(JourneySlugPage)
