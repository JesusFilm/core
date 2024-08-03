import { gql } from '@apollo/client'
import { useRouter } from 'next/router'
import { AuthAction, withUser, withUserTokenSSR } from 'next-firebase-auth'
import { ReactElement, useEffect } from 'react'

import { JOURNEY_DUPLICATE } from '@core/journeys/ui/useJourneyDuplicateMutation'

import { GetTeams } from '../../../__generated__/GetTeams'
import {
  JourneyDuplicate,
  JourneyDuplicateVariables
} from '../../../__generated__/JourneyDuplicate'
import {
  JourneyNotificationUpdate,
  JourneyNotificationUpdateVariables
} from '../../../__generated__/JourneyNotificationUpdate'
import { initAndAuthApp } from '../../../src/libs/initAndAuthApp'
import { JOURNEY_NOTIFICATION_UPDATE } from '../../../src/libs/useJourneyNotificationUpdate/useJourneyNotificationUpdate'

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
    void router.push(`/templates/${router.query.journeyId as string}`)
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
    if (journeyDuplicate?.journeyDuplicate.id != null) {
      await apolloClient.mutate<
        JourneyNotificationUpdate,
        JourneyNotificationUpdateVariables
      >({
        mutation: JOURNEY_NOTIFICATION_UPDATE,
        variables: {
          input: {
            journeyId: journeyDuplicate.journeyDuplicate.id,
            visitorInteractionEmail: true
          }
        }
      })
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
      destination: `/templates/${(query?.journeyId ?? '') as string}`,
      permanent: false
    }
  }
})

export default withUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(TemplateQuickPage)
