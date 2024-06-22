import { AuthAction, withUser, withUserTokenSSR } from 'next-firebase-auth'
import { ReactElement } from 'react'

import { GetAdminJourney } from '../../../__generated__/GetAdminJourney'
import { initAndAuthApp } from '../../../src/libs/initAndAuthApp'
import { GET_ADMIN_JOURNEY } from '../[journeyId]'

function JourneyQuickPage(): ReactElement {
  return <>Quick</>
}

export const getServerSideProps = withUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ user, locale, query, resolvedUrl }) => {
  const { apolloClient, flags, redirect, translations } = await initAndAuthApp({
    user,
    locale,
    resolvedUrl
  })

  if (redirect != null) return { redirect }

  try {
    const { data } = await apolloClient.query<GetAdminJourney>({
      query: GET_ADMIN_JOURNEY,
      variables: {
        id: query?.journeyId
      }
    })

    if (data.journey?.template === true) {
      return {
        redirect: {
          permanent: false,
          destination: `/publisher/${data.journey?.id}`
        }
      }
    }
  } catch (error) {
    if (error.message === 'journey not found') {
      return {
        redirect: {
          permanent: false,
          destination: `/`
        }
      }
    }
    if (error.message === 'user is not allowed to view journey') {
      return {
        props: {
          status: 'noAccess',
          ...translations,
          flags,
          initialApolloState: apolloClient.cache.extract()
        }
      }
    }
    throw error
  }

  return {
    props: {}
  }
})

export default withUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(JourneyQuickPage)
