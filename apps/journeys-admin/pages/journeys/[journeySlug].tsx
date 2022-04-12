import { ReactElement } from 'react'
import { gql, useQuery } from '@apollo/client'
import { BLOCK_FIELDS, IMAGE_FIELDS } from '@core/journeys/ui'
import { useRouter } from 'next/router'
import {
  AuthAction,
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import { NextSeo } from 'next-seo'
import { JourneyInvite } from '../../src/components/JourneyInvite/JourneyInvite'
import { GetJourney } from '../../__generated__/GetJourney'
import { JourneyProvider } from '../../src/libs/context'
import { JourneyView } from '../../src/components/JourneyView'
import { addApolloState, initializeApollo } from '../../src/libs/apolloClient'
import { PageWrapper } from '../../src/components/PageWrapper'
import { Menu } from '../../src/components/JourneyView/Menu'

export const GET_JOURNEY = gql`
  ${BLOCK_FIELDS}
  ${IMAGE_FIELDS}
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
      themeName
      themeMode
      seoTitle
      seoDescription
      blocks {
        ...BlockFields
      }
      primaryImageBlock {
        ...ImageFields
      }
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
          <NextSeo
            title={data.journey.title}
            description={data.journey.description ?? undefined}
          />
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
          <NextSeo title="Access Denied" />
          <JourneyInvite journeySlug={router.query.journeySlug as string} />
        </>
      )}
      {error?.graphQLErrors[0].message === 'User invitation pending.' && (
        <>
          <NextSeo title="Access Denied" />
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
