import { ReactElement } from 'react'
import { gql, useQuery } from '@apollo/client'
import Head from 'next/head'
import { BLOCK_FIELDS } from '@core/journeys/ui'
import {
  AuthAction,
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import { useRouter } from 'next/router'
import {
  addApolloState,
  initializeApollo
} from '../../../src/libs/apolloClient'
import { GetJourneyForEdit } from '../../../__generated__/GetJourneyForEdit'
import { Editor } from '../../../src/components/Editor'
import { PageWrapper } from '../../../src/components/PageWrapper'

const GET_JOURNEY_FOR_EDIT = gql`
  ${BLOCK_FIELDS}
  query GetJourneyForEdit($id: ID!) {
    journey: adminJourney(id: $id, idType: slug) {
      id
      slug
      themeName
      themeMode
      title
      description
      blocks {
        ...BlockFields
      }
    }
  }
`
function JourneyEditPage(): ReactElement {
  const router = useRouter()
  const AuthUser = useAuthUser()
  const { data } = useQuery<GetJourneyForEdit>(GET_JOURNEY_FOR_EDIT, {
    variables: { id: router.query.journeySlug }
  })

  return (
    <>
      {data?.journey != null && (
        <>
          <Head>
            <title>{data.journey.title}</title>
          </Head>
          <PageWrapper
            title={data.journey.title}
            showDrawer
            backHref={`/journeys/${router.query.journeySlug as string}`}
            AuthUser={AuthUser}
          >
            <Editor journey={data.journey} />
          </PageWrapper>
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
      query: GET_JOURNEY_FOR_EDIT,
      variables: {
        id: query.journeySlug
      }
    })
  } catch (error) {
    if (error?.graphQLErrors[0].extensions.code === 'FORBIDDEN')
      return {
        redirect: {
          destination: `/journeys/${query.journeySlug as string}`,
          permanent: false
        }
      }
    throw error
  }

  return addApolloState(apolloClient, {
    props: {
      journeySlug: query.journeySlug
    }
  })
})

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(JourneyEditPage)
