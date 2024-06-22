import { useQuery } from '@apollo/client'
import { AuthAction, withUser, withUserTokenSSR } from 'next-firebase-auth'
import { useRouter } from 'next/router'
import {
  GetAdminJourney,
  GetAdminJourneyVariables
} from '../../../__generated__/GetAdminJourney'
import { initAndAuthApp } from '../../../src/libs/initAndAuthApp'
import { JOURNEY_DUPLICATE } from '../../../src/libs/useJourneyDuplicateMutation'
import { GET_ADMIN_JOURNEY } from '../[journeyId]'

export const GET_USER_TEAMS = gql`
query GetUserTeamsAndInvites($teamId: ID!, $where: UserTeamFilterInput!) {
  userTeams(teamId: $teamId, where: $where) {
    id
    role
    user {
      email
      firstName
      id
      imageUrl
      lastName
    }
  }
}
`

function JourneyQuickPage() {
  const router = useRouter()
  const { data } = useQuery<GetAdminJourney, GetAdminJourneyVariables>(
    GET_ADMIN_JOURNEY,
    {
      variables: { id: router.query.journeyId as string }
    }
  )

  console.log(data)
  return <>Quick</>
}

export const getServerSideProps = withUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ user, locale, query, resolvedUrl }) => {
  if (user == null)
    return { redirect: { permanent: false, destination: '/users/sign-in' } }

  const { apolloClient, redirect, translations } = await initAndAuthApp({
    user,
    locale,
    resolvedUrl
  })

  if (redirect != null) return { redirect }

  console.log('query', query)

  // check if they have more than one team
  // redirect back to templates page and open modal to add journey
  try {
    await apolloClient.mutate({
      mutation: JOURNEY_DUPLICATE,
      variables: {
        id: query?.journeyId
      }
    })
  } catch (error) {
    console.log(error)
  }

  return {
    props: {
      ...translations
    }
  }
})

export default withUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(JourneyQuickPage)
