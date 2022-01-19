import { ReactElement } from 'react'
import { gql, useQuery } from '@apollo/client'
import Head from 'next/head'
import { BLOCK_FIELDS } from '@core/journeys/ui'
import { useRouter } from 'next/router'
import {
  AuthAction,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import { INVITE_USER_MODAL_FIELDS } from '../../src/components/InviteUserModal'
import { GetJourney } from '../../__generated__/GetJourney'
import { JourneyProvider } from '../../src/components/JourneyView/Context'
import { JourneyView } from '../../src/components/JourneyView'
import { addApolloState, initializeApollo } from '../../src/libs/apolloClient'

const GET_JOURNEY = gql`
  ${BLOCK_FIELDS}
  ${INVITE_USER_MODAL_FIELDS}
  query GetJourney($id: ID!) {
    adminJourney(id: $id, idType: slug) {
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
  const { data } = useQuery<GetJourney>(GET_JOURNEY, {
    variables: { id: router.query.journeySlug }
  })

  return (
    <>
      {data?.adminJourney != null && (
        <>
          <Head>
            <title>{data.adminJourney.title}</title>
          </Head>
          <JourneyProvider value={data.adminJourney}>
            <JourneyView />
          </JourneyProvider>
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
  await apolloClient.query({
    query: GET_JOURNEY,
    variables: {
      id: query.journeySlug
    }
  })

  return addApolloState(apolloClient, {
    props: {}
  })
})

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(JourneySlugPage)
