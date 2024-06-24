import { AuthAction, withUser, withUserTokenSSR } from 'next-firebase-auth'
import { ReactElement, useEffect } from 'react'

import { gql } from '@apollo/client'
import { JOURNEY_DUPLICATE } from '@core/journeys/ui/useJourneyDuplicateMutation'
import { useRouter } from 'next/router'
import { GetTeams } from '../../../__generated__/GetTeams'
import {
  JourneyDuplicate,
  JourneyDuplicateVariables
} from '../../../__generated__/JourneyDuplicate'
import { initAndAuthApp } from '../../../src/libs/initAndAuthApp'

export const GET_TEAMS = gql`
  query GetTeams {
    teams {
      id
    }
  }
`

function TemplateQuickPage(): ReactElement {
  const router = useRouter()

  useEffect(() => {
    router.push(`/templates/${router.query.journeyId}`)
  }, [router])

  return <></>
}

export const getServerSideProps = withUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async ({ user, locale, resolvedUrl, query }) => {
  const { redirect, apolloClient } = await initAndAuthApp({
    user,
    locale,
    resolvedUrl
  })

  if (redirect != null) return { redirect }

  const { data: getTeams } = await apolloClient.query<GetTeams>({
    query: GET_TEAMS
  })

  if (getTeams.teams.length === 1 && query?.journeyId != null) {
    const { data: journeyDuplicate } = await apolloClient.mutate<
      JourneyDuplicate,
      JourneyDuplicateVariables
    >({
      mutation: JOURNEY_DUPLICATE,
      variables: {
        id: query.journeyId.toString(),
        teamId: getTeams.teams[0].id
      }
    })
    if (journeyDuplicate?.journeyDuplicate.id) {
      return {
        redirect: {
          destination: `/journeys/${journeyDuplicate.journeyDuplicate.id}/quick`,
          permanent: false
        }
      }
    }
  }

  return {
    redirect: {
      destination: `/templates/${query?.journeyId ?? ''}`,
      permanent: false
    }
  }
})

export default withUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(TemplateQuickPage)
