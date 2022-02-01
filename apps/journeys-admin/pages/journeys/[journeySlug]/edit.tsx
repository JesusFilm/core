import { ReactElement } from 'react'
import { useQuery } from '@apollo/client'
import {
  AuthAction,
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import {
  addApolloState,
  initializeApollo
} from '../../../src/libs/apolloClient'
import { GetJourney } from '../../../__generated__/GetJourney'
import { Editor } from '../../../src/components/Editor'
import { PageWrapper } from '../../../src/components/PageWrapper'
import { GET_JOURNEY } from '../[journeySlug]'

function JourneyEditPage(): ReactElement {
  const router = useRouter()
  const AuthUser = useAuthUser()
  const { data } = useQuery<GetJourney>(GET_JOURNEY, {
    variables: { id: router.query.journeySlug }
  })

  return (
    <>
      {data?.journey != null && (
        <>
          <NextSeo
            title={`Edit ${data.journey.title}`}
            description={data.journey.description ?? undefined}
          />
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
      query: GET_JOURNEY,
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
